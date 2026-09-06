using Itam.Application.DTOs.Dashboard;
using Itam.Application.Interfaces;
using Itam.Application.Responses;
using Itam.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Itam.WebApi.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public sealed class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("overview")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<DashboardOverviewDto>>> GetOverview(CancellationToken cancellationToken)
    {
        var overview = await _dashboardService.GetOverviewAsync(cancellationToken);
        return Ok(ApiResponse.Ok(overview, "Dashboard overview retrieved successfully."));
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<MyDashboardDto>>> GetMyDashboard(CancellationToken cancellationToken)
    {
        var dashboard = await _dashboardService.GetMyDashboardAsync(cancellationToken);
        return Ok(ApiResponse.Ok(dashboard, "Your dashboard retrieved successfully."));
    }
}