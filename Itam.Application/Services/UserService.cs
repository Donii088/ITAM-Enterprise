using AutoMapper;
using Itam.Application.Common;
using Itam.Application.DTOs.Users;
using Itam.Application.Interfaces;
using Itam.Domain.Entities;
using Itam.Domain.Enums;
using Itam.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Itam.Application.Services;

public sealed class UserService : IUserService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IApplicationDbContext dbContext,
        IPasswordHasher passwordHasher,
        IMapper mapper,
        TimeProvider timeProvider,
        ILogger<UserService> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<UserDto> CreateAsync(CreateUserRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = _mapper.Map<User>(request);
        user.PasswordHash = _passwordHasher.Hash(request.Password);
        user.IsActive = true;

        _dbContext.Users.Add(user);
        await SaveWithDuplicateEmailGuardAsync(cancellationToken);

        _logger.LogInformation("User {UserId} ({Email}) created.", user.Id, user.Email);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Id == id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(User), id);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<PagedResult<UserDto>> GetPagedAsync(GetUsersQuery query, CancellationToken cancellationToken = default)
    {
        IQueryable<User> users = _dbContext.Users.AsNoTracking();

        if (!query.IncludeInactive)
        {
            users = users.Where(u => u.IsActive);
        }

        if (query.Role.HasValue)
        {
            users = users.Where(u => u.Role == query.Role.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var term = query.SearchTerm.Trim().ToLower();

            users = users.Where(u =>
                u.FirstName.ToLower().Contains(term) ||
                u.LastName.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term));
        }

        var totalCount = await users.CountAsync(cancellationToken);

        var items = await users
            .OrderBy(u => u.FirstName).ThenBy(u => u.LastName)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<UserDto>(
            _mapper.Map<List<UserDto>>(items),
            query.PageNumber,
            query.PageSize,
            totalCount);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(User), id);

        if (!user.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase) &&
            await _dbContext.Users.AnyAsync(u => u.Email == request.Email && u.Id != id, cancellationToken))
        {
            throw new BusinessRuleViolationException("A user with this email already exists.");
        }

        _mapper.Map(request, user);
        await SaveWithDuplicateEmailGuardAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated.", user.Id);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .Include(u => u.AssetAssignments.Where(a => a.UnassignedAt == null))
                .ThenInclude(a => a.Asset)
            .Include(u => u.RefreshTokens)
            .SingleOrDefaultAsync(u => u.Id == id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(User), id);

        if (!user.IsActive)
        {
            throw new BusinessRuleViolationException("User is already inactive.");
        }

        var utcNow = _timeProvider.GetUtcNow().UtcDateTime;
        user.IsActive = false;

        foreach (var assignment in user.AssetAssignments)
        {
            assignment.UnassignedAt = utcNow;
            assignment.Asset.Status = AssetStatus.Available;
        }

        foreach (var token in user.RefreshTokens.Where(t => t.Revoked == null))
        {
            token.Revoked = utcNow;
            token.ReasonRevoked = "Account deactivated";
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User {UserId} deactivated. {AssetCount} asset(s) released, {TokenCount} session(s) revoked.",
            user.Id, user.AssetAssignments.Count, user.RefreshTokens.Count);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(User), id);

        if (user.IsActive)
        {
            throw new BusinessRuleViolationException("User is already active.");
        }

        user.IsActive = true;
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} re-activated.", user.Id);

        return _mapper.Map<UserDto>(user);
    }

    public async Task HardDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(User), id);

        var assignmentCount = await _dbContext.AssetAssignments.CountAsync(a => a.EmployeeId == id, cancellationToken);
        var ticketCount = await _dbContext.Tickets.CountAsync(t => t.EmployeeId == id, cancellationToken);
        var repairCount = await _dbContext.RepairHistories.CountAsync(r => r.AdminId == id, cancellationToken);

        if (assignmentCount + ticketCount + repairCount > 0)
        {
            throw new BusinessRuleViolationException(
                $"User cannot be hard deleted: {assignmentCount} assignment(s), {ticketCount} ticket(s), " +
                $"{repairCount} repair record(s) reference this user. Deactivate the user instead to preserve history.");
        }

        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogWarning("User {UserId} ({Email}) hard deleted.", user.Id, user.Email);
    }

    private async Task SaveWithDuplicateEmailGuardAsync(CancellationToken cancellationToken)
    {
        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("IX_Users_Email") == true)
        {
            throw new BusinessRuleViolationException("A user with this email already exists.");
        }
    }
}