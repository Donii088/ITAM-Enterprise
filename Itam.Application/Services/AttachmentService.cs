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

    public async Task<AttachmentDto> UploadForTicketAsync(Guid ticketId, UploadAttachmentRequest request, CancellationToken ct = default)
    {
        var userId = RequireUserId();

        var ticket = await _dbContext.Tickets.SingleOrDefaultAsync(t => t.Id == ticketId, ct)
            ?? throw new EntityNotFoundException(nameof(Ticket), ticketId);

        if (!IsAdmin() && ticket.EmployeeId != userId)
        {
            throw new ForbiddenException("You can only attach files to your own tickets.");
        }

        return await SaveAsync(request, a => a.TicketId = ticketId, "tickets", ct);
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

        return await SaveAsync(request, a => a.RepairHistoryId = repairId, "repairs", ct);
    }

    public async Task<AttachmentDto> UploadForAssetAsync(Guid assetId, UploadAttachmentRequest request, CancellationToken ct = default)
    {
        RequireUserId();

        if (!await _dbContext.Assets.AnyAsync(a => a.Id == assetId, ct))
        {
            throw new EntityNotFoundException(nameof(Asset), assetId);
        }

        return await SaveAsync(request, a => a.AssetId = assetId, "assets", ct);
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

        var items = await _dbContext.Attachments.AsNoTracking()
            .Where(a => a.TicketId == ticketId)
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
            .Where(a => a.AssetId == assetId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        return items.Select(Map).ToList();
    }

    public async Task<AttachmentFileDto> GetForDownloadAsync(Guid id, CancellationToken ct = default)
    {
        var userId = RequireUserId();

        var attachment = await _dbContext.Attachments
            .Include(a => a.Ticket)
            .SingleOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Attachment), id);

        if (attachment.TicketId.HasValue && !IsAdmin() && attachment.Ticket!.EmployeeId != userId)
        {
            throw new ForbiddenException("You can only download attachments of your own tickets.");
        }

        if (!attachment.TicketId.HasValue && !IsAdmin())
        {
            throw new ForbiddenException("Only IT admins can download this attachment.");
        }

        return new AttachmentFileDto(Map(attachment), _fileStorage.GetFullPath(attachment.FilePath));
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var userId = RequireUserId();

        var attachment = await _dbContext.Attachments
            .Include(a => a.Ticket)
            .SingleOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Attachment), id);

        if (attachment.TicketId.HasValue && !IsAdmin() && attachment.Ticket!.EmployeeId != userId)
        {
            throw new ForbiddenException("You can only delete attachments of your own tickets.");
        }

        if (!attachment.TicketId.HasValue && !IsAdmin())
        {
            throw new ForbiddenException("Only IT admins can delete this attachment.");
        }

        await _fileStorage.DeleteAsync(attachment.FilePath, ct);

        _dbContext.Attachments.Remove(attachment);
        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation("Attachment {Id} deleted by {UserId}.", id, userId);
    }

    private async Task<AttachmentDto> SaveAsync(
        UploadAttachmentRequest request, Action<Attachment> setOwner, string subFolder, CancellationToken ct)
    {
        ValidateFile(request);

        var extension = Path.GetExtension(request.FileName)!.ToLowerInvariant();
        var uniqueName = $"{Guid.NewGuid()}{extension}";

        var relativePath = await _fileStorage.SaveAsync(request.Content, subFolder, uniqueName, ct);

        var attachment = new Attachment
        {
            FileName = Path.GetFileNameWithoutExtension(request.FileName),
            FileExtension = extension,
            FileSize = request.Size,
            FilePath = relativePath,
            ContentType = request.ContentType
        };

        setOwner(attachment);

        _dbContext.Attachments.Add(attachment);
        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation("Attachment {Id} stored at {Path}.", attachment.Id, relativePath);

        return Map(attachment);
    }

    private void ValidateFile(UploadAttachmentRequest request)
    {
        var extension = Path.GetExtension(request.FileName);

        if (string.IsNullOrEmpty(extension) ||
            !_settings.AllowedExtensions.Contains(extension.ToLowerInvariant()))
        {
            throw new BusinessRuleViolationException(
                $"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", _settings.AllowedExtensions)}.");
        }

        if (request.Size <= 0)
        {
            throw new BusinessRuleViolationException("The uploaded file is empty.");
        }

        if (request.Size > _settings.MaxFileSizeBytes)
        {
            throw new BusinessRuleViolationException(
                $"File exceeds the maximum allowed size of {(_settings.MaxFileSizeBytes / (1024 * 1024))} MB.");
        }
    }

    private Guid RequireUserId()
        => _currentUserService.UserId ?? throw new UnauthorizedException("You must be authenticated.");

    private bool IsAdmin() => _currentUserService.Role == RoleConstants.ItAdmin;

    private static AttachmentDto Map(Attachment attachment) => new(
        attachment.Id,
        attachment.FileName,
        attachment.FileExtension,
        attachment.FileSize,
        attachment.ContentType,
        attachment.TicketId,
        attachment.RepairHistoryId,
        attachment.AssetId,
        attachment.CreatedAt);
}