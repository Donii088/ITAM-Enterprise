using Itam.Application.Common;
using Itam.Application.DTOs.Search;
using Itam.Application.Interfaces;
using Itam.Domain.Constants;
using Itam.Domain.Entities;
using Itam.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Itam.Application.Services;

public sealed class SearchService : ISearchService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<SearchService> _logger;

    public SearchService(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService,
        ILogger<SearchService> logger)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<SearchResultsDto> SearchAsync(GetSearchQuery query, CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedException("You must be authenticated to search.");

        var isAdmin = _currentUserService.Role == RoleConstants.ItAdmin;
        var term = query.Term.Trim().ToLower();

        var users = await SearchUsersAsync(term, isAdmin, userId, query.Limit, ct);
        var assets = await SearchAssetsAsync(term, isAdmin, userId, query.Limit, ct);
        var tickets = await SearchTicketsAsync(term, isAdmin, userId, query.Limit, ct);

        _logger.LogInformation(
            "Global search '{Term}' by {UserId}: {Users} user(s), {Assets} asset(s), {Tickets} ticket(s).",
            query.Term, userId, users.Count, assets.Count, tickets.Count);

        return new SearchResultsDto(users, assets, tickets, users.Count + assets.Count + tickets.Count);
    }

    private async Task<List<SearchItemDto>> SearchUsersAsync(
        string term, bool isAdmin, Guid userId, int limit, CancellationToken ct)
    {
        var query = _dbContext.Users.AsNoTracking().AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(u => u.Id == userId);
        }

        var matches = await query
            .Where(u =>
                u.FirstName.ToLower().Contains(term)
                || u.LastName.ToLower().Contains(term)
                || u.Email.ToLower().Contains(term)
                || u.JobTitle.ToLower().Contains(term))
            .OrderBy(u => u.FirstName)
            .Take(limit)
            .ToListAsync(ct);

        return matches
            .Select(u => new SearchItemDto(
                u.Id,
                "User",
                $"{u.FirstName} {u.LastName}",
                u.Email,
                u.Role.ToString(),
                // Priority is otherwise ticket-specific; reused here to surface account status,
                // matching this DTO's existing pattern of repurposing generic fields per entity type.
                u.IsActive ? "Active" : "Inactive",
                u.CreatedAt))
            .ToList();
    }

    private async Task<List<SearchItemDto>> SearchAssetsAsync(
        string term, bool isAdmin, Guid userId, int limit, CancellationToken ct)
    {
        var query = _dbContext.Assets.AsNoTracking().AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(a => _dbContext.AssetAssignments
                .Any(x => x.AssetId == a.Id && x.EmployeeId == userId && x.UnassignedAt == null));
        }

        var matches = await query
            .Where(a =>
                (a is Laptop && (((Laptop)a).Brand.ToLower().Contains(term)
                    || ((Laptop)a).Model.ToLower().Contains(term)
                    || ((Laptop)a).SerialNumber.ToLower().Contains(term)))
                || (a is DesktopPc && (((DesktopPc)a).Brand.ToLower().Contains(term)
                    || ((DesktopPc)a).Model.ToLower().Contains(term)
                    || ((DesktopPc)a).SerialNumber.ToLower().Contains(term)))
                || (a is Monitor && (((Monitor)a).Brand.ToLower().Contains(term)
                    || ((Monitor)a).Resolution.ToLower().Contains(term)
                    || (((Monitor)a).SerialNumber != null && ((Monitor)a).SerialNumber!.ToLower().Contains(term))))
                || (a is Dock && (((Dock)a).Brand.ToLower().Contains(term)
                    || (((Dock)a).SerialNumber != null && ((Dock)a).SerialNumber!.ToLower().Contains(term))))
                || (a is KeyboardMouseSet && (((KeyboardMouseSet)a).Brand.ToLower().Contains(term)
                    || (((KeyboardMouseSet)a).SerialNumber != null && ((KeyboardMouseSet)a).SerialNumber!.ToLower().Contains(term))))
                || (a is Headset && (((Headset)a).Brand.ToLower().Contains(term)
                    || (((Headset)a).SerialNumber != null && ((Headset)a).SerialNumber!.ToLower().Contains(term))))
                // UnassignedAt == null (active assignment) guarantees a non-null employee.
                || _dbContext.AssetAssignments.Any(x => x.AssetId == a.Id
                    && x.UnassignedAt == null
                    && (x.Employee!.FirstName + " " + x.Employee.LastName).ToLower().Contains(term)))
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToListAsync(ct);

        return matches
            .Select(a =>
            {
                var (brand, model, serial) = AssetSummaries.Summarize(a);
                return new SearchItemDto(
                    a.Id,
                    "Asset",
                    $"{brand} {model}".Trim(),
                    serial,
                    a.Status.ToString(),
                    null,
                    a.CreatedAt);
            })
            .ToList();
    }

    private async Task<List<SearchItemDto>> SearchTicketsAsync(
        string term, bool isAdmin, Guid userId, int limit, CancellationToken ct)
    {
        var query = _dbContext.Tickets.AsNoTracking().AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(t => t.EmployeeId == userId);
        }

        var matches = await query
            .Include(t => t.Employee)
            .Where(t => t.Title.ToLower().Contains(term)
                || t.Description.ToLower().Contains(term)
                // Lets a search for a person's name surface their tickets too, not just tickets
                // whose title/description happens to mention that text. Matches the same
                // "search by owner's name" pattern already used for assets above.
                || (t.Employee != null && (t.Employee.FirstName + " " + t.Employee.LastName).ToLower().Contains(term)))
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .ToListAsync(ct);

        return matches
            .Select(t => new SearchItemDto(
                t.Id,
                "Ticket",
                t.Title,
                t.Employee is null ? "Deleted User" : $"{t.Employee.FirstName} {t.Employee.LastName}",
                t.Status.ToString(),
                t.Priority.ToString(),
                t.CreatedAt))
            .ToList();
    }
}