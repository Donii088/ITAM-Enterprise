using Itam.Application.DTOs.Assets;
using Itam.Application.DTOs.Assignments;
using Itam.Application.Interfaces;
using Itam.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Itam.WebApi.Controllers;

[ApiController]
[Route("api/export")]
[Authorize(Roles = RoleConstants.ItAdmin)]
public sealed class ExportController : ControllerBase
{
    private readonly IExportService _exportService;

    public ExportController(IExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpGet("assets")]
    public async Task<IActionResult> ExportAssets([FromQuery] GetAssetsQuery query, CancellationToken cancellationToken)
    {
        var (content, fileName) = await _exportService.ExportAssetsAsync(query, cancellationToken);
        return File(content, "text/csv", fileName);
    }

    [HttpGet("assignments")]
    public async Task<IActionResult> ExportAssignments([FromQuery] GetAssignmentsQuery query, CancellationToken cancellationToken)
    {
        var (content, fileName) = await _exportService.ExportAssignmentsAsync(query, cancellationToken);
        return File(content, "text/csv", fileName);
    }
}