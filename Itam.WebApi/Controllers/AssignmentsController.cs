using Itam.Application.Common;
using Itam.Application.DTOs.Assignments;
using Itam.Application.Interfaces;
using Itam.Application.Responses;
using Itam.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Itam.WebApi.Controllers;

[ApiController]
[Route("api/assignments")]
[Authorize]
public sealed class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentsController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpPost]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> Assign(
        [FromBody] CreateAssignmentRequestDto request,
        CancellationToken cancellationToken)
    {
        var assignment = await _assignmentService.AssignAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(assignment, "Asset assigned successfully."));
    }

    [HttpPost("{id:guid}/unassign")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> Unassign(Guid id, CancellationToken cancellationToken)
    {
        var assignment = await _assignmentService.UnassignAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok(assignment, "Asset unassigned successfully."));
    }

    [HttpPost("asset/{assetId:guid}/unassign")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> UnassignByAsset(Guid assetId, CancellationToken cancellationToken)
    {
        var assignment = await _assignmentService.UnassignByAssetAsync(assetId, cancellationToken);
        return Ok(ApiResponse.Ok(assignment, "Asset unassigned successfully."));
    }

    [HttpGet("my-assets")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AssignmentDto>>>> GetMyAssets(CancellationToken cancellationToken)
    {
        var assets = await _assignmentService.GetMyAssetsAsync(cancellationToken);
        return Ok(ApiResponse.Ok(assets, "Your currently assigned assets."));
    }

    [HttpGet("asset/{assetId:guid}/history")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AssignmentDto>>>> GetAssetHistory(
        Guid assetId, CancellationToken cancellationToken)
    {
        var history = await _assignmentService.GetAssetHistoryAsync(assetId, cancellationToken);
        return Ok(ApiResponse.Ok(history, "Assignment history retrieved successfully."));
    }

    [HttpGet]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<PagedResult<AssignmentDto>>>> Get(
        [FromQuery] GetAssignmentsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _assignmentService.GetPagedAsync(query, cancellationToken);
        return Ok(ApiResponse.Ok(result, "Assignments retrieved successfully."));
    }
}