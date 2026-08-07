using Itam.Application.Common;
using Itam.Application.DTOs.Auth;
using Itam.Application.Interfaces;
using Itam.Domain.Entities;
using Itam.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Itam.Application.Services;

public sealed class AuthService : IAuthService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ISecureTokenGenerator _secureTokenGenerator;
    private readonly JwtSettings _jwtSettings;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IApplicationDbContext dbContext,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        ISecureTokenGenerator secureTokenGenerator,
        IOptions<JwtSettings> jwtSettings,
        TimeProvider timeProvider,
        ILogger<AuthService> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _secureTokenGenerator = secureTokenGenerator;
        _jwtSettings = jwtSettings.Value;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for email {Email}.", request.Email);
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Login attempt for inactive account {Email}.", user.Email);
            throw new UnauthorizedException("This account is inactive. Contact your IT administrator.");
        }

        var refreshToken = CreateRefreshToken(user.Id);
        _dbContext.RefreshTokens.Add(refreshToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} ({Email}) logged in.", user.Id, user.Email);

        return BuildAuthResponse(user, refreshToken.Token);
    }

    public async Task<AuthResponseDto> RefreshAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken = default)
    {
        var token = await _dbContext.RefreshTokens
            .Include(t => t.User)
            .SingleOrDefaultAsync(t => t.Token == request.RefreshToken, cancellationToken);

        if (token is null)
        {
            _logger.LogWarning("Refresh attempt with unknown token.");
            throw new UnauthorizedException("Invalid refresh token.");
        }

        if (token.IsRevoked)
        {
            // Reuse of a rotated token indicates potential theft. Revoke the entire family.
            await RevokeAllUserTokensAsync(token.UserId, "Token reuse detected - possible theft", cancellationToken);
            _logger.LogError("Refresh token reuse detected for user {UserId}. All sessions revoked.", token.UserId);
            throw new UnauthorizedException("Invalid refresh token.");
        }

        if (token.IsExpired)
        {
            _logger.LogWarning("Refresh attempt with expired token for user {UserId}.", token.UserId);
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");
        }

        if (!token.User.IsActive)
        {
            await RevokeAllUserTokensAsync(token.UserId, "User account deactivated", cancellationToken);
            _logger.LogWarning("Refresh attempt for deactivated user {UserId}. All sessions revoked.", token.UserId);
            throw new UnauthorizedException("This account is inactive. Contact your IT administrator.");
        }

        // Token rotation: revoke the presented token and issue a replacement.
        var utcNow = _timeProvider.GetUtcNow().UtcDateTime;
        token.Revoked = utcNow;
        token.ReasonRevoked = "Rotated";

        var newToken = CreateRefreshToken(token.UserId);
        token.ReplacedByToken = newToken.Token;

        _dbContext.RefreshTokens.Add(newToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Refresh token rotated for user {UserId}.", token.UserId);

        return BuildAuthResponse(token.User, newToken.Token);
    }

    public async Task LogoutAsync(LogoutRequestDto request, CancellationToken cancellationToken = default)
    {
        var token = await _dbContext.RefreshTokens
            .SingleOrDefaultAsync(t => t.Token == request.RefreshToken, cancellationToken);

        if (token is not null && token.IsActive)
        {
            token.Revoked = _timeProvider.GetUtcNow().UtcDateTime;
            token.ReasonRevoked = "Logged out";
            await _dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("User {UserId} logged out.", token.UserId);
        }
    }

    private RefreshToken CreateRefreshToken(Guid userId)
    {
        var utcNow = _timeProvider.GetUtcNow().UtcDateTime;

        return new RefreshToken
        {
            Token = _secureTokenGenerator.Generate(),
            UserId = userId,
            Created = utcNow,
            Expires = utcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays)
        };
    }

    private async Task RevokeAllUserTokensAsync(Guid userId, string reason, CancellationToken cancellationToken)
    {
        var utcNow = _timeProvider.GetUtcNow().UtcDateTime;

        var activeTokens = await _dbContext.RefreshTokens
            .Where(t => t.UserId == userId && t.Revoked == null)
            .ToListAsync(cancellationToken);

        foreach (var activeToken in activeTokens)
        {
            activeToken.Revoked = utcNow;
            activeToken.ReasonRevoked = reason;
        }
    }

    private AuthResponseDto BuildAuthResponse(User user, string refreshTokenValue)
    {
        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var expiresAt = _timeProvider.GetUtcNow().UtcDateTime.AddMinutes(_jwtSettings.AccessTokenExpirationInMinutes);

        return new AuthResponseDto(
            accessToken,
            refreshTokenValue,
            expiresAt,
            new AuthUserDto(user.Id, user.FirstName, user.LastName, user.Email, user.JobTitle, user.Role.ToString()));
    }
}