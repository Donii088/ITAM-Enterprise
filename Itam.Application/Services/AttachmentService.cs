using Itam.Application.Common;
using Itam.Application.DTOs.Attachments;
using Itam.Application.Interfaces;
using Itam.Domain.Constants;
using Itam.Domain.Entities;
using Itam.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;



namespace Itam.Application.Services;

public sealed class AttachmentService : IAttachmentService
{
    private const int MaxFileNameLength = 200;

    // Extension -> the content type(s) a browser/client should legitimately report for it.
    // Rejecting mismatches stops a caller from labeling, say, an HTML payload as a ".jpg" to
    // trick a viewer that trusts the extension.
    private static readonly Dictionary<string, string[]> ExpectedContentTypesByExtension = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = new[] { "image/jpeg" },
        [".jpeg"] = new[] { "image/jpeg" },
        [".png"] = new[] { "image/png" },
        [".webp"] = new[] { "image/webp" },
        [".pdf"] = new[] { "application/pdf" },
    };

    // Magic-byte signatures for the extensions above, so a renamed executable/script can't ride
    // through on extension + declared content type alone. Checked against the first bytes of the
    // actual upload stream, not anything the client asserts.
    private static readonly Dictionary<string, byte[][]> SignaturesByExtension = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = new[] { new byte[] { 0xFF, 0xD8, 0xFF } },
        [".jpeg"] = new[] { new byte[] { 0xFF, 0xD8, 0xFF } },
        [".png"] = new[] { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } },
        [".webp"] = new[] { new byte[] { 0x52, 0x49, 0x46, 0x46 } }, // "RIFF"; "WEBP" at offset 8 is checked separately.
        [".pdf"] = new[] { new byte[] { 0x25, 0x50, 0x44, 0x46 } }, // "%PDF"
    };

    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorage;
    private readonly FileStorageSettings _settings;
    private readonly ILogger<AttachmentService> _logger;

    public AttachmentService(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorage,
        IOptions<FileStorageSettings> settings,
        ILogger<AttachmentService> logger)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _fileStorage = fileStorage;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<AttachmentDto> UploadForTicketAsync(Guid ticketId, UploadAttachmentRequest request, Guid userId ,CancellationToken ct = default)
    {
         userId = RequireUserId();

        var ticket = await _dbContext.Tickets.SingleOrDefaultAsync(t => t.Id == ticketId, ct)
            ?? throw new EntityNotFoundException(nameof(Ticket), ticketId);

        if (!IsAdmin() && ticket.EmployeeId != userId)
        {
            throw new ForbiddenException("You can only attach files to your own tickets.");
        }

        // Grouped by the ticket's owning employee (not necessarily the uploader — an admin may
        // attach a photo on the employee's behalf) so all of one person's ticket photos live
        // together. EmployeeId can be null if that user was since deleted (anonymized); fall
        // back to the uploader's id so the folder segment is never empty. Either way this is a
        // server-resolved Guid, never client input.
        var subFolder = $"tickets/{ticket.EmployeeId ?? userId}";
        return await SaveAsync(request, a => a.TicketId = ticketId, subFolder, userId, ct);
    }

    public async Task<AttachmentDto> UploadForRepairAsync(Guid repairId, UploadAttachmentRequest request, CancellationToken ct = default)
    {
        var userId = RequireUserId();

        var repair = await _dbContext.RepairHistories
            .Include(r => r.Ticket)
            .SingleOrDefaultAsync(r => r.Id == repairId, ct)
            ?? throw new EntityNotFoundException(nameof(RepairHistory), repairId);

        if (!IsAdmin() && repair.Ticket.EmployeeId != userId)
        {
            throw new ForbiddenException("You can only attach files to repairs of your own tickets.");
        }

        return await SaveAsync(request, a => a.RepairHistoryId = repairId, "repairs", userId, ct);
    }

    public async Task<AttachmentDto> UploadForAssetAsync(Guid assetId, UploadAttachmentRequest request,CancellationToken ct = default)
    {
        var userId = RequireUserId();

        if (!await _dbContext.Assets.AnyAsync(a => a.Id == assetId, ct))
        {
            throw new EntityNotFoundException(nameof(Asset), assetId);
        }

        return await SaveAsync(request, a => a.AssetId = assetId, "assets", userId, ct);
    }

    public async Task<IReadOnlyList<AttachmentDto>> GetByTicketAsync(Guid ticketId, CancellationToken ct = default)
    {
        var userId = RequireUserId();

        var ticket = await _dbContext.Tickets.SingleOrDefaultAsync(t => t.Id == ticketId, ct)
            ?? throw new EntityNotFoundException(nameof(Ticket), ticketId);

        if (!IsAdmin() && ticket.EmployeeId != userId)
        {
            throw new ForbiddenException("You can only view attachments of your own tickets.");
        }

        // Includes photos uploaded at ticket-resolution time (linked via RepairHistory rather
        // than the ticket directly) so resolution photos show up in the same gallery.
        var items = await _dbContext.Attachments.AsNoTracking()
            .Include(a => a.UploadedBy)
            .Where(a => a.TicketId == ticketId
                || (a.RepairHistoryId != null && a.RepairHistory!.TicketId == ticketId))
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        return items.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<AttachmentDto>> GetByRepairAsync(Guid repairId, CancellationToken ct = default)
    {
        var userId = RequireUserId();

        var repair = await _dbContext.RepairHistories
            .AsNoTracking()
            .Include(r => r.Ticket)
            .SingleOrDefaultAsync(r => r.Id == repairId, ct)
            ?? throw new EntityNotFoundException(nameof(RepairHistory), repairId);

        if (!IsAdmin() && repair.Ticket.EmployeeId != userId)
        {
            throw new ForbiddenException("You can only view attachments of repairs of your own tickets.");
        }

        var items = await _dbContext.Attachments.AsNoTracking()
            .Include(a => a.UploadedBy)
            .Where(a => a.RepairHistoryId == repairId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        return items.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<AttachmentDto>> GetByAssetAsync(Guid assetId, CancellationToken ct = default)
    {
        if (!await _dbContext.Assets.AnyAsync(a => a.Id == assetId, ct))
        {
            throw new EntityNotFoundException(nameof(Asset), assetId);
        }

        var items = await _dbContext.Attachments.AsNoTracking()
            .Include(a => a.UploadedBy)
            .Where(a => a.AssetId == assetId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        return items.Select(Map).ToList();
    }

    public async Task<AttachmentFileDto> GetForDownloadAsync(Guid id, CancellationToken ct = default)
    {
        var userId = RequireUserId();

        var attachment = await LoadWithOwnersAsync(id, ct);

        EnsureCanAccess(attachment, userId, "download");

        return new AttachmentFileDto(Map(attachment), _fileStorage.GetFullPath(attachment.FilePath));
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var userId = RequireUserId();

        var attachment = await LoadWithOwnersAsync(id, ct);

        EnsureCanAccess(attachment, userId, "delete");

        await _fileStorage.DeleteAsync(attachment.FilePath, ct);

        _dbContext.Attachments.Remove(attachment);
        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation("Attachment {Id} deleted by {UserId}.", id, userId);
    }

    private async Task<Attachment> LoadWithOwnersAsync(Guid id, CancellationToken ct)
    {
        return await _dbContext.Attachments
            .Include(a => a.Ticket)
            .Include(a => a.RepairHistory).ThenInclude(r => r!.Ticket)
            .Include(a => a.UploadedBy)
            .SingleOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Attachment), id);
    }

    /// <summary>
    /// Resolves the ticket that "owns" an attachment for access-control purposes — either
    /// directly (TicketId) or through the repair it was uploaded against as a resolution photo
    /// (RepairHistoryId -&gt; RepairHistory.Ticket). Asset attachments have neither and are
    /// admin-only, matching the rest of the asset management surface.
    /// </summary>
    private void EnsureCanAccess(Attachment attachment, Guid userId, string action)
    {
        if (IsAdmin())
        {
            return;
        }

        var owningTicket = attachment.Ticket ?? attachment.RepairHistory?.Ticket;

        if (owningTicket is not null)
        {
            if (owningTicket.EmployeeId != userId)
            {
                throw new ForbiddenException($"You can only {action} attachments of your own tickets.");
            }
            return;
        }

        throw new ForbiddenException($"Only IT admins can {action} this attachment.");
    }

    private async Task<AttachmentDto> SaveAsync(
        UploadAttachmentRequest request, Action<Attachment> setOwner, string subFolder, Guid uploadedByUserId, CancellationToken ct)
    {
        var extension = ValidateFile(request);

        await ValidateSignatureAsync(request, extension, ct);

        var uniqueName = $"{Guid.NewGuid()}{extension}";
        var relativePath = await _fileStorage.SaveAsync(request.Content, subFolder, uniqueName, ct);

        var attachment = new Attachment
        {
            FileName = TrimFileName(Path.GetFileNameWithoutExtension(request.FileName)),
            FileExtension = extension,
            FileSize = request.Size,
            FilePath = relativePath,
            ContentType = request.ContentType,
            UploadedByUserId = uploadedByUserId
        };

        setOwner(attachment);

        try
        {
            _dbContext.Attachments.Add(attachment);
            await _dbContext.SaveChangesAsync(ct);
        }
        catch
        {
            // Don't leave an orphaned physical file behind if the DB write failed after the
            // file was already written to disk.
            await _fileStorage.DeleteAsync(relativePath, CancellationToken.None);
            throw;
        }

        _logger.LogInformation("Attachment {Id} stored at {Path} by {UserId}.", attachment.Id, relativePath, uploadedByUserId);

        return Map(attachment, uploaderName: null);
    }

    private string ValidateFile(UploadAttachmentRequest request)
    {
        var extension = Path.GetExtension(request.FileName);

        if (string.IsNullOrEmpty(extension) ||
            !_settings.AllowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
        {
            throw new BusinessRuleViolationException(
                $"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", _settings.AllowedExtensions)}.");
        }

        extension = extension.ToLowerInvariant();

        if (request.Size <= 0)
        {
            throw new BusinessRuleViolationException("The uploaded file is empty.");
        }

        if (request.Size > _settings.MaxFileSizeBytes)
        {
            throw new BusinessRuleViolationException(
                $"File exceeds the maximum allowed size of {(_settings.MaxFileSizeBytes / (1024 * 1024))} MB.");
        }

        var nameWithoutExtension = Path.GetFileNameWithoutExtension(request.FileName);
        if (nameWithoutExtension.Length > MaxFileNameLength)
        {
            throw new BusinessRuleViolationException(
                $"File name is too long. Maximum {MaxFileNameLength} characters.");
        }

        if (ExpectedContentTypesByExtension.TryGetValue(extension, out var expectedContentTypes) &&
            !expectedContentTypes.Contains(request.ContentType, StringComparer.OrdinalIgnoreCase))
        {
            throw new BusinessRuleViolationException(
                $"The file's content type ('{request.ContentType}') does not match its extension.");
        }

        return extension;
    }

    /// <summary>
    /// Confirms the first bytes of the actual upload match the extension's expected file
    /// signature, so a disguised executable/script can't pass just by having the right extension
    /// and a spoofed Content-Type. Silently skips the check if the stream can't be rewound — the
    /// upload still goes through the extension/content-type checks above either way.
    /// </summary>
    private static async Task ValidateSignatureAsync(UploadAttachmentRequest request, string extension, CancellationToken ct)
    {
        if (!SignaturesByExtension.TryGetValue(extension, out var signatures) || !request.Content.CanSeek)
        {
            return;
        }

        var startPosition = request.Content.Position;
        var header = new byte[16];
        var read = await request.Content.ReadAsync(header.AsMemory(0, header.Length), ct);
        request.Content.Position = startPosition;

        var matches = signatures.Any(signature => read >= signature.Length && header.AsSpan(0, signature.Length).SequenceEqual(signature));

        if (matches && extension == ".webp")
        {
            matches = read >= 12 && header.AsSpan(8, 4).SequenceEqual("WEBP"u8);
        }

        if (!matches)
        {
            throw new BusinessRuleViolationException(
                "The file's contents don't match its extension. Make sure you're uploading a genuine file of that type.");
        }
    }

    private static string TrimFileName(string name) =>
        name.Length > MaxFileNameLength ? name[..MaxFileNameLength] : name;

    private Guid RequireUserId()
        => _currentUserService.UserId ?? throw new UnauthorizedException("You must be authenticated.");

    private bool IsAdmin() => _currentUserService.Role == RoleConstants.ItAdmin;

    private static AttachmentDto Map(Attachment attachment) =>
        Map(attachment, attachment.UploadedBy is null ? null : $"{attachment.UploadedBy.FirstName} {attachment.UploadedBy.LastName}");

    private static AttachmentDto Map(Attachment attachment, string? uploaderName) => new(
        attachment.Id,
        attachment.FileName,
        attachment.FileExtension,
        attachment.FileSize,
        attachment.ContentType,
        attachment.TicketId,
        attachment.RepairHistoryId,
        attachment.AssetId,
        attachment.UploadedByUserId,
        uploaderName,
        attachment.CreatedAt);
}
