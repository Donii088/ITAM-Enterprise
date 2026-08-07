using Itam.Application.Common;
using Itam.Application.DTOs.Assets;
using Itam.Application.DTOs.Dashboard;
using Itam.Application.DTOs.Tickets;
using Itam.Application.Interfaces;
using Itam.Domain.Entities;
using Itam.Domain.Enums;
using Itam.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Itam.Application.Services;

public sealed class DashboardService : IDashboardService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService,
        TimeProvider timeProvider,
        ILogger<DashboardService> logger)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<DashboardOverviewDto> GetOverviewAsync(CancellationToken ct = default)
    {
        var monthAgo = _timeProvider.GetUtcNow().UtcDateTime.AddDays(-30);

        var assetsTotal = await _dbContext.Assets.CountAsync(ct);

        var byType = (await _dbContext.Assets.AsNoTracking()
            .GroupBy(a => a.AssetType)
            .Select(g => new { Key = g.Key, Count = g.Count() })
            .ToListAsync(ct))
            .Select(x => new CountDto(x.Key.ToString(), x.Count))
            .ToList();

        var byStatus = (await _dbContext.Assets.AsNoTracking()
            .GroupBy(a => a.Status)
            .Select(g => new { Key = g.Key, Count = g.Count() })
            .ToListAsync(ct))
            .Select(x => new CountDto(x.Key.ToString(), x.Count))
            .ToList();

        var storageTotal = await _dbContext.StorageDevices.CountAsync(ct);
        var storageUnassigned = await _dbContext.StorageDevices
            .CountAsync(s => s.LaptopId == null && s.DesktopPcId == null, ct);

        var usersTotal = await _dbContext.Users.CountAsync(ct);
        var usersActive = await _dbContext.Users.CountAsync(u => u.IsActive, ct);

        var ticketsTotal = await _dbContext.Tickets.CountAsync(ct);

        var ticketsOpen = await _dbContext.Tickets.CountAsync(t =>
            t.Status == TicketStatus.Open
            || t.Status == TicketStatus.OnReview
            || t.Status == TicketStatus.InProgress, ct);

        var ticketsByStatus = (await _dbContext.Tickets.AsNoTracking()
            .GroupBy(t => t.Status)
            .Select(g => new { Key = g.Key, Count = g.Count() })
            .ToListAsync(ct))
            .Select(x => new CountDto(x.Key.ToString(), x.Count))
            .ToList();

        var ticketsByPriority = (await _dbContext.Tickets.AsNoTracking()
            .GroupBy(t => t.Priority)
            .Select(g => new { Key = g.Key, Count = g.Count() })
            .ToListAsync(ct))
            .Select(x => new CountDto(x.Key.ToString(), x.Count))
            .ToList();

        var repairsTotal = await _dbContext.RepairHistories.CountAsync(ct);
        var repairsLast30 = await _dbContext.RepairHistories
            .CountAsync(r => r.RepairDate >= monthAgo, ct);

        var topRepaired = await _dbContext.RepairHistories.AsNoTracking()
            .GroupBy(r => r.AssetId)
            .Select(g => new { AssetId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync(ct);

        var topTicketed = await _dbContext.Tickets.AsNoTracking()
            .GroupBy(t => t.AssetId)
            .Select(g => new { AssetId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync(ct);

        var topIds = topRepaired.Select(x => x.AssetId)
            .Concat(topTicketed.Select(x => x.AssetId))
            .Distinct()
            .ToList();

        var topAssets = await _dbContext.Assets.AsNoTracking()
            .Where(a => topIds.Contains(a.Id))
            .ToListAsync(ct);

        var overview = new DashboardOverviewDto(
            new AssetStatsDto(assetsTotal, byType, byStatus),
            new StorageStatsDto(storageTotal, storageUnassigned),
            new PeopleStatsDto(usersTotal, usersActive, usersTotal - usersActive),
            new TicketStatsDto(ticketsTotal, ticketsOpen, ticketsByStatus, ticketsByPriority),
            new RepairStatsDto(repairsTotal, repairsLast30),
            topRepaired.Select(x => MapTop(x.AssetId, x.Count, topAssets)).ToList(),
            topTicketed.Select(x => MapTop(x.AssetId, x.Count, topAssets)).ToList());

        _logger.LogInformation("Dashboard overview generated.");

        return overview;
    }

    public async Task<MyDashboardDto> GetMyDashboardAsync(CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedException("You must be authenticated.");

        var assigned = await _dbContext.AssetAssignments.AsNoTracking()
            .Include(a => a.Asset)
            .Include(a => a.Employee)
            .Where(a => a.EmployeeId == userId && a.UnassignedAt == null)
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync(ct);

        var openTickets = await _dbContext.Tickets.CountAsync(t =>
            t.EmployeeId == userId
            && (t.Status == TicketStatus.Open
                || t.Status == TicketStatus.OnReview
                || t.Status == TicketStatus.InProgress), ct);

        var recent = await _dbContext.Tickets.AsNoTracking()
            .Include(t => t.Employee)
            .Include(t => t.Asset)
            .Where(t => t.EmployeeId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .ToListAsync(ct);

        return new MyDashboardDto(
            assigned.Count,
            assigned.Select(MapAssignment).ToList(),
            openTickets,
            recent.Select(MapTicket).ToList());
    }

    private static TopAssetDto MapTop(Guid assetId, int count, List<Asset> assets)
    {
        var asset = assets.First(a => a.Id == assetId);
        var (brand, model, serial) = AssetSummaries.Summarize(asset);

        return new TopAssetDto(asset.Id, asset.AssetType, brand, model, serial, count);
    }

    private static AssetListItemDto MapAssignment(AssetAssignment assignment)
    {
        var (brand, model, serial) = AssetSummaries.Summarize(assignment.Asset);

        return new AssetListItemDto(
            assignment.AssetId,
            assignment.Asset.AssetType,
            assignment.Asset.Status,
            brand,
            model,
            serial,
            $"{assignment.Employee.FirstName} {assignment.Employee.LastName}",
            assignment.Asset.CreatedAt);
    }

    private static TicketDto MapTicket(Ticket ticket)
    {
        var (brand, model, serial) = AssetSummaries.Summarize(ticket.Asset);

        return new TicketDto(
            ticket.Id,
            ticket.Title,
            ticket.Description,
            ticket.Priority,
            ticket.Status,
            ticket.EmployeeId,
            $"{ticket.Employee.FirstName} {ticket.Employee.LastName}",
            ticket.AssetId,
            ticket.Asset.AssetType,
            brand,
            model,
            serial,
            ticket.CreatedAt,
            ticket.UpdatedAt);
    }
}