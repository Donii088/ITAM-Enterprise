using Itam.Application.Common;
using Itam.Application.DTOs.Assignments;
using Itam.Application.Interfaces;
using Itam.Domain.Entities;
using Itam.Domain.Enums;
using Itam.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Itam.Application.Services;

public sealed class AssignmentService : IAssignmentService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AssignmentService> _logger;

    public AssignmentService(
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService,
        TimeProvider timeProvider,
        ILogger<AssignmentService> logger)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<AssignmentDto> AssignAsync(CreateAssignmentRequestDto request, CancellationToken ct = default)
    {
        var asset = await _dbContext.Assets.SingleOrDefaultAsync(a => a.Id == request.AssetId, ct)
            ?? throw new EntityNotFoundException(nameof(Asset), request.AssetId);

        var employee = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == request.EmployeeId, ct)
            ?? throw new EntityNotFoundException(nameof(User), request.EmployeeId);

        if (!employee.IsActive)
        {
            throw new BusinessRuleViolationException("Assets cannot be assigned to inactive employees.");
        }

        if (asset.Status != AssetStatus.Available)
        {
            throw new BusinessRuleViolationException(
                $"Asset is currently '{asset.Status}'. Only assets with status 'Available' can be assigned.");
        }

        if (await _dbContext.AssetAssignments.AnyAsync(a => a.AssetId == asset.Id && a.UnassignedAt == null, ct))
        {
            throw new BusinessRuleViolationException("Asset already has an active assignment.");
        }

        var assignment = new AssetAssignment
        {
            AssetId = asset.Id,
            EmployeeId = employee.Id,
            AssignedAt = _timeProvider.GetUtcNow().UtcDateTime
        };

        asset.Status = AssetStatus.Assigned;

        _dbContext.AssetAssignments.Add(assignment);
        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Asset {AssetId} assigned to employee {EmployeeId} (Assignment {AssignmentId}).",
            asset.Id, employee.Id, assignment.Id);

        assignment.Asset = asset;
        assignment.Employee = employee;

        return Map(assignment);
    }

    public async Task<AssignmentDto> UnassignAsync(Guid assignmentId, CancellationToken ct = default)
    {
        var assignment = await _dbContext.AssetAssignments
            .Include(a => a.Asset)
            .Include(a => a.Employee)
            .SingleOrDefaultAsync(a => a.Id == assignmentId, ct)
            ?? throw new EntityNotFoundException(nameof(AssetAssignment), assignmentId);

        if (assignment.UnassignedAt != null)
        {
            throw new BusinessRuleViolationException("This assignment has already been closed.");
        }

        assignment.UnassignedAt = _timeProvider.GetUtcNow().UtcDateTime;

        if (assignment.Asset.Status == AssetStatus.Assigned)
        {
            assignment.Asset.Status = AssetStatus.Available;
        }

        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Assignment {AssignmentId} closed. Asset {AssetId} released (status {Status}).",
            assignment.Id, assignment.AssetId, assignment.Asset.Status);

        return Map(assignment);
    }

    public async Task<IReadOnlyList<AssignmentDto>> GetMyAssetsAsync(CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedException("You must be authenticated to view your assets.");

        var assignments = await _dbContext.AssetAssignments
            .AsNoTracking()
            .Include(a => a.Asset)
            .Include(a => a.Employee)
            .Where(a => a.EmployeeId == userId && a.UnassignedAt == null)
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync(ct);

        return assignments.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<AssignmentDto>> GetAssetHistoryAsync(Guid assetId, CancellationToken ct = default)
    {
        if (!await _dbContext.Assets.AnyAsync(a => a.Id == assetId, ct))
        {
            throw new EntityNotFoundException(nameof(Asset), assetId);
        }

        var assignments = await _dbContext.AssetAssignments
            .AsNoTracking()
            .Include(a => a.Asset)
            .Include(a => a.Employee)
            .Where(a => a.AssetId == assetId)
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync(ct);

        return assignments.Select(Map).ToList();
    }

    public async Task<PagedResult<AssignmentDto>> GetPagedAsync(GetAssignmentsQuery query, CancellationToken ct = default)
    {
        IQueryable<AssetAssignment> assignments = _dbContext.AssetAssignments.AsNoTracking();

        if (query.EmployeeId.HasValue)
        {
            assignments = assignments.Where(a => a.EmployeeId == query.EmployeeId.Value);
        }

        if (query.AssetId.HasValue)
        {
            assignments = assignments.Where(a => a.AssetId == query.AssetId.Value);
        }

        if (query.ActiveOnly)
        {
            assignments = assignments.Where(a => a.UnassignedAt == null);
        }

        var totalCount = await assignments.CountAsync(ct);

        var items = await assignments
            .Include(a => a.Asset)
            .Include(a => a.Employee)
            .OrderByDescending(a => a.AssignedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new PagedResult<AssignmentDto>(
            items.Select(Map).ToList(),
            query.PageNumber,
            query.PageSize,
            totalCount);
    }

    private static AssignmentDto Map(AssetAssignment assignment)
    {
        var (brand, model, serial) = assignment.Asset switch
        {
            Laptop l => (l.Brand, l.Model, l.SerialNumber),
            DesktopPc p => (p.Brand, p.Model, p.SerialNumber),
            Monitor m => (m.Brand, m.Resolution, (string?)null),
            Dock d => (d.Brand, (string?)null, (string?)null),
            KeyboardMouseSet k => (k.Brand, (string?)null, (string?)null),
            _ => ((string?)null, (string?)null, (string?)null)
        };

        return new AssignmentDto(
            assignment.Id,
            assignment.AssetId,
            assignment.Asset.AssetType,
            brand,
            model,
            serial,
            assignment.EmployeeId,
            $"{assignment.Employee.FirstName} {assignment.Employee.LastName}",
            assignment.AssignedAt,
            assignment.UnassignedAt,
            assignment.UnassignedAt == null);
    }
}