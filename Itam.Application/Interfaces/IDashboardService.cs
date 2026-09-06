using Itam.Application.DTOs.Dashboard;

namespace Itam.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardOverviewDto> GetOverviewAsync(CancellationToken ct = default);
    Task<MyDashboardDto> GetMyDashboardAsync(CancellationToken ct = default);
}