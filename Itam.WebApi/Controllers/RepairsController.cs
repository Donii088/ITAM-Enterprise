using Itam.Application.Common;
using Itam.Application.DTOs.Repairs;
using Itam.Application.Interfaces;
using Itam.Application.Responses;
using Itam.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Itam.WebApi.Controllers;

[ApiController]
[Route("api/repairs")]
[Authorize]
public sealed class RepairsController : ControllerBase
{
    private readonly IRepairService _repairService;

    public RepairsController(IRepairService repairService)
    {
        _repairService = repairService;
    }

    [HttpGet("ticket/{ticketId:guid}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<RepairHistoryDto>>>> GetByTicket(
        Guid ticketId, CancellationToken cancellationToken)
    {
        var repairs = await _repairService.GetByTicketAsync(ticketId, cancellationToken);
        return Ok(ApiResponse.Ok(repairs, "Repair history retrieved successfully."));
    }

    [HttpGet("asset/{assetId:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<RepairHistoryDto>>>> GetByAsset(
        Guid assetId, CancellationToken cancellationToken)
    {
        var repairs = await _repairService.GetByAssetAsync(assetId, cancellationToken);
        return Ok(ApiResponse.Ok(repairs, "Repair history retrieved successfully."));
    }

    [HttpGet]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<PagedResult<RepairHistoryDto>>>> Get(
        [FromQuery] GetRepairsQuery query, CancellationToken cancellationToken)
    {
        var result = await _repairService.GetPagedAsync(query, cancellationToken);
        return Ok(ApiResponse.Ok(result, "Repairs retrieved successfully."));
    }
}