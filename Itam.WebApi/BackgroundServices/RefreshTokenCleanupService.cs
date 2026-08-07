using Itam.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Itam.WebApi.BackgroundServices;

public sealed class RefreshTokenCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<RefreshTokenCleanupService> _logger;

    public RefreshTokenCleanupService(
        IServiceScopeFactory scopeFactory,
        TimeProvider timeProvider,
        ILogger<RefreshTokenCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupAsync(stoppingToken);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Refresh token cleanup failed.");
            }

            try
            {
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task CleanupAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var now = _timeProvider.GetUtcNow().UtcDateTime;

        // 1. Expired tokens (older than 30 days past their expiry date)
        var expired = await dbContext.RefreshTokens
            .Where(t => t.Expires < now.AddDays(-30))
            .ToListAsync(ct);

        // 2. Revoked tokens (older than 30 days since they were revoked)
        var oldRevoked = await dbContext.RefreshTokens
            .Where(t => t.Revoked != null && t.Revoked < now.AddDays(-30))
            .ToListAsync(ct);

        var toDelete = expired
            .Concat(oldRevoked)
            .DistinctBy(t => t.Id)
            .ToList();

        if (toDelete.Count == 0)
        {
            _logger.LogInformation("Refresh token cleanup: nothing to remove.");
            return;
        }

        dbContext.RefreshTokens.RemoveRange(toDelete);
        await dbContext.SaveChangesAsync(ct);

        _logger.LogInformation("Refresh token cleanup removed {Count} token(s).", toDelete.Count);
    }
}