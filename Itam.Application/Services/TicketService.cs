using Itam.Application.Common;
using Itam.Application.DTOs.Tickets;
using Itam.Application.Interfaces;
using Itam.Domain.Constants;
using Itam.Domain.Entities;
using Itam.Domain.Enums;
using Itam.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Itam.Application.Services;

public sealed class TicketService : ITicketService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<TicketService> _logger;

    public TicketService(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService,
        TimeProvider timeProvider,
        ILogger<TicketService> logger)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<TicketDto> CreateAsync(CreateTicketRequestDto request, CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedException("You must be authenticated to create a ticket.");

        var asset = await _dbContext.Assets.SingleOrDefaultAsync(a => a.Id == request.AssetId, ct)
            ?? throw new EntityNotFoundException(nameof(Asset), request.AssetId);

        var isAssignedToMe = await _dbContext.AssetAssignments
            .AnyAsync(a => a.AssetId == asset.Id && a.EmployeeId == userId && a.UnassignedAt == null, ct);

        if (!isAssignedToMe)
        {
            throw new BusinessRuleViolationException(
                "You can only create tickets for assets currently assigned to you.");
        }

        var ticket = new Ticket
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            Status = TicketStatus.Open,
            EmployeeId = userId,
            AssetId = asset.Id
        };

        _dbContext.Tickets.Add(ticket);
        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Ticket {TicketId} created by employee {UserId} for asset {AssetId} (Priority {Priority}).",
            ticket.Id, userId, asset.Id, request.Priority);

        return await GetByIdInternalAsync(ticket.Id, ct);
    }

    public async Task<TicketDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var ticket = await LoadTrackedAsync(id, ct);
        EnsureOwnerOrAdmin(ticket);
        return Map(ticket);
    }

    public async Task<PagedResult<TicketDto>> GetMyTicketsAsync(GetTicketsQuery query, CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedException("You must be authenticated.");

        return await GetPagedInternalAsync(query, userId, ct);
    }

    public async Task<PagedResult<TicketDto>> GetPagedAsync(GetTicketsQuery query, CancellationToken ct = default)
    {
        return await GetPagedInternalAsync(query, null, ct);
    }

    public async Task<TicketDto> CancelAsync(Guid id, CancellationToken ct = default)
    {
        var ticket = await LoadTrackedAsync(id, ct);
        EnsureOwnerOrAdmin(ticket);

        if (ticket.Status is TicketStatus.Done or TicketStatus.Cancelled)
        {
            throw new BusinessRuleViolationException(
                $"A ticket with status '{ticket.Status}' cannot be cancelled.");
        }

        ticket.Status = TicketStatus.Cancelled;
        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation("Ticket {TicketId} cancelled by {UserId}.", ticket.Id, _currentUserService.UserId);

        return Map(ticket);
    }

    public async Task<TicketDto> UpdateStatusAsync(Guid id, UpdateTicketStatusRequestDto request, CancellationToken ct = default)
    {
        var ticket = await LoadTrackedAsync(id, ct);

        if (request.Status == TicketStatus.Done)
        {
            throw new BusinessRuleViolationException(
                "Tickets are completed via the resolve endpoint, which records the repair history.");
        }

        if (ticket.Status is TicketStatus.Done or TicketStatus.Cancelled)
        {
            throw new BusinessRuleViolationException(
                $"A ticket with status '{ticket.Status}' cannot change status.");
        }

        ticket.Status = request.Status;
        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation("Ticket {TicketId} status changed to {Status} by admin.", ticket.Id, request.Status);

        return Map(ticket);
    }

    private async Task<PagedResult<TicketDto>> GetPagedInternalAsync(GetTicketsQuery query, Guid? ownerOnly, CancellationToken ct)
    {
        IQueryable<Ticket> tickets = _dbContext.Tickets.AsNoTracking();

        if (ownerOnly.HasValue)
        {
            tickets = tickets.Where(t => t.EmployeeId == ownerOnly.Value);
        }

        if (query.Status.HasValue)
        {
            tickets = tickets.Where(t => t.Status == query.Status.Value);
        }

        if (query.Priority.HasValue)
        {
            tickets = tickets.Where(t => t.Priority == query.Priority.Value);
        }

        if (query.EmployeeId.HasValue)
        {
            tickets = tickets.Where(t => t.EmployeeId == query.EmployeeId.Value);
        }

        if (query.AssetId.HasValue)
        {
            tickets = tickets.Where(t => t.AssetId == query.AssetId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var term = query.SearchTerm.Trim().ToLower();

            tickets = tickets.Where(t =>
                t.Title.ToLower().Contains(term) || t.Description.ToLower().Contains(term));
        }

        var totalCount = await tickets.CountAsync(ct);

        var items = await tickets
            .Include(t => t.Employee)
            .Include(t => t.Asset)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new PagedResult<TicketDto>(
            items.Select(Map).ToList(),
            query.PageNumber,
            query.PageSize,
            totalCount);
    }

    private async Task<TicketDto> GetByIdInternalAsync(Guid id, CancellationToken ct)
    {
        var ticket = await _dbContext.Tickets
            .AsNoTracking()
            .Include(t => t.Employee)
            .Include(t => t.Asset)
            .SingleOrDefaultAsync(t => t.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Ticket), id);

        return Map(ticket);
    }

    private async Task<Ticket> LoadTrackedAsync(Guid id, CancellationToken ct)
    {
        return await _dbContext.Tickets
            .Include(t => t.Employee)
            .Include(t => t.Asset)
            .SingleOrDefaultAsync(t => t.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Ticket), id);
    }

    private void EnsureOwnerOrAdmin(Ticket ticket)
    {
        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedException("You must be authenticated.");

        var isAdmin = _currentUserService.Role == RoleConstants.ItAdmin;

        if (!isAdmin && ticket.EmployeeId != userId)
        {
            throw new ForbiddenException("You can only access your own tickets.");
        }
    }

    private static TicketDto Map(Ticket ticket)
    {
        var (brand, model, serial) = ticket.Asset switch
        {
            Laptop l => (l.Brand, l.Model, l.SerialNumber),
            DesktopPc p => (p.Brand, p.Model, p.SerialNumber),
            Monitor m => (m.Brand, m.Resolution, (string?)null),
            Dock d => (d.Brand, (string?)null, (string?)null),
            KeyboardMouseSet k => (k.Brand, (string?)null, (string?)null),
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