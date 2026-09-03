using Itam.Application.Common;
using Itam.Application.DTOs.Repairs;
using Itam.Application.DTOs.Tickets;
using Itam.Application.Interfaces;
using Itam.Domain.Constants;
using Itam.Domain.Entities;
using Itam.Domain.Enums;
using Itam.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Itam.Application.Services;

public sealed class RepairService : IRepairService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<RepairService> _logger;

    public RepairService(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService,
        TimeProvider timeProvider,
        ILogger<RepairService> logger)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<ResolveTicketResultDto> ResolveTicketAsync(
        Guid ticketId, ResolveTicketRequestDto request, CancellationToken ct = default)
    {
        var adminId = _currentUserService.UserId
            ?? throw new UnauthorizedException("You must be authenticated to resolve tickets.");

        var ticket = await _dbContext.Tickets
            .Include(t => t.Asset)
            .Include(t => t.Employee)
            .SingleOrDefaultAsync(t => t.Id == ticketId, ct)
            ?? throw new EntityNotFoundException(nameof(Ticket), ticketId);

        if (ticket.Status is TicketStatus.Done or TicketStatus.Cancelled)
        {
            throw new BusinessRuleViolationException(
                $"A ticket with status '{ticket.Status}' cannot be resolved.");
        }

        var utcNow = _timeProvider.GetUtcNow().UtcDateTime;

        var repair = new RepairHistory
        {
            TicketId = ticket.Id,
            AssetId = ticket.AssetId,
            AdminId = adminId,
            RepairDescription = request.RepairDescription,
            RepairDate = utcNow
        };

        ticket.Status = TicketStatus.Done;

        // Heal the asset: back to the employee if still assigned, otherwise to the shelf.
        var hasActiveAssignment = await _dbContext.AssetAssignments
            .AnyAsync(a => a.AssetId == ticket.AssetId && a.UnassignedAt == null, ct);

        ticket.Asset.Status = hasActiveAssignment ? AssetStatus.Assigned : AssetStatus.Available;

        _dbContext.RepairHistories.Add(repair);
        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Ticket {TicketId} resolved by admin {AdminId}. Repair {RepairId} recorded; asset {AssetId} set to {Status}.",
            ticket.Id, adminId, repair.Id, ticket.AssetId, ticket.Asset.Status);

        repair.Ticket = ticket;
        repair.Asset = ticket.Asset;
        repair.Admin = null!; // loaded below for mapping

        var admin = await _dbContext.Users.AsNoTracking()
            .SingleOrDefaultAsync(u => u.Id == adminId, ct);

        return new ResolveTicketResultDto(MapTicket(ticket), MapRepair(repair, admin));
    }

    public async Task<IReadOnlyList<RepairHistoryDto>> GetByTicketAsync(Guid ticketId, CancellationToken ct = default)
    {
        var ticket = await _dbContext.Tickets.AsNoTracking()
            .SingleOrDefaultAsync(t => t.Id == ticketId, ct)
            ?? throw new EntityNotFoundException(nameof(Ticket), ticketId);

        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedException("You must be authenticated.");

        var isAdmin = _currentUserService.Role == RoleConstants.ItAdmin;

        if (!isAdmin && ticket.EmployeeId != userId)
        {
            throw new ForbiddenException("You can only view repairs for your own tickets.");
        }

        var repairs = await Query()
            .Where(r => r.TicketId == ticketId)
            .OrderByDescending(r => r.RepairDate)
            .ToListAsync(ct);

        return repairs.Select(MapRepair).ToList();
    }

    public async Task<IReadOnlyList<RepairHistoryDto>> GetByAssetAsync(Guid assetId, CancellationToken ct = default)
    {
        if (!await _dbContext.Assets.AnyAsync(a => a.Id == assetId, ct))
        {
            throw new EntityNotFoundException(nameof(Asset), assetId);
        }

        var repairs = await Query()
            .Where(r => r.AssetId == assetId)
            .OrderByDescending(r => r.RepairDate)
            .ToListAsync(ct);

        return repairs.Select(MapRepair).ToList();
    }

    public async Task<PagedResult<RepairHistoryDto>> GetPagedAsync(GetRepairsQuery query, CancellationToken ct = default)
    {
        IQueryable<RepairHistory> repairs = Query();

        if (query.AssetId.HasValue)
        {
            repairs = repairs.Where(r => r.AssetId == query.AssetId.Value);
        }

        if (query.TicketId.HasValue)
        {
            repairs = repairs.Where(r => r.TicketId == query.TicketId.Value);
        }

        if (query.AdminId.HasValue)
        {
            repairs = repairs.Where(r => r.AdminId == query.AdminId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var term = query.SearchTerm.Trim().ToLower();
            repairs = repairs.Where(r => r.RepairDescription.ToLower().Contains(term));
        }

        var totalCount = await repairs.CountAsync(ct);

        var items = await repairs
            .OrderByDescending(r => r.RepairDate)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new PagedResult<RepairHistoryDto>(
            items.Select(MapRepair).ToList(),
            query.PageNumber,
            query.PageSize,
            totalCount);
    }

    private IQueryable<RepairHistory> Query()
        => _dbContext.RepairHistories
            .AsNoTracking()
            .Include(r => r.Ticket)
            .Include(r => r.Asset)
            .Include(r => r.Admin);

    private static RepairHistoryDto MapRepair(RepairHistory repair)
        => MapRepairInternal(repair);

    private static RepairHistoryDto MapRepair(RepairHistory repair, User? admin)
    {
        var dto = MapRepairInternal(repair);
        return admin is null ? dto : dto with { AdminName = $"{admin.FirstName} {admin.LastName}" };
    }

    private static RepairHistoryDto MapRepairInternal(RepairHistory repair)
    {
        var (brand, model, serial) = repair.Asset switch
        {
            Laptop l => (l.Brand, l.Model, l.SerialNumber),
            DesktopPc p => (p.Brand, p.Model, p.SerialNumber),
            Monitor m => (m.Brand, m.Resolution, m.SerialNumber),
            Dock d => (d.Brand, (string?)null, d.SerialNumber),
            KeyboardMouseSet k => (k.Brand, (string?)null, k.SerialNumber),
            Headset h => (h.Brand, (string?)null, h.SerialNumber),
            _ => ((string?)null, (string?)null, (string?)null)
        };

        return new RepairHistoryDto(
            repair.Id,
            repair.TicketId,
            repair.Ticket.Title,
            repair.AssetId,
            repair.Asset.AssetType,
            brand,
            model,
            serial,
            repair.AdminId,
            repair.Admin is null ? "Deleted User" : $"{repair.Admin.FirstName} {repair.Admin.LastName}",
            repair.RepairDescription,
            repair.RepairDate,
            repair.CreatedAt);
    }

    private static TicketDto MapTicket(Ticket ticket)
    {
        var (brand, model, serial) = ticket.Asset switch
        {
            Laptop l => (l.Brand, l.Model, l.SerialNumber),
            DesktopPc p => (p.Brand, p.Model, p.SerialNumber),
            Monitor m => (m.Brand, m.Resolution, m.SerialNumber),
            Dock d => (d.Brand, (string?)null, d.SerialNumber),
            KeyboardMouseSet k => (k.Brand, (string?)null, k.SerialNumber),
            Headset h => (h.Brand, (string?)null, h.SerialNumber),
            _ => ((string?)null, (string?)null, (string?)null)
        };

        return new TicketDto(
            ticket.Id,
            ticket.Title,
            ticket.Description,
            ticket.Priority,
            ticket.Status,
            ticket.EmployeeId,
            ticket.Employee is null ? "Deleted User" : $"{ticket.Employee.FirstName} {ticket.Employee.LastName}",
            ticket.AssetId,
            ticket.Asset.AssetType,
            brand,
            model,
            serial,
            ticket.CreatedAt,
            ticket.UpdatedAt);
    }
}