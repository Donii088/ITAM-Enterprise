using Itam.Application.Common;
using Itam.Application.DTOs.Assets;
using Itam.Application.Interfaces;
using Itam.Application.Responses;
using Itam.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Itam.WebApi.Controllers;

[ApiController]
[Route("api/assets")]
[Authorize]
public sealed class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;

    public AssetsController(IAssetService assetService)
    {
        _assetService = assetService;
    }

    [HttpGet]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<PagedResult<AssetListItemDto>>>> Get(
        [FromQuery] GetAssetsQuery query, CancellationToken cancellationToken)
    {
        var result = await _assetService.GetPagedAsync(query, cancellationToken);
        return Ok(ApiResponse.Ok(result, "Assets retrieved successfully."));
    }

    // Any authenticated user may fetch a single asset's details; employees are scoped to
    // assets that are or were assigned to them inside GetDetailsForViewerAsync.
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var asset = await _assetService.GetDetailsForViewerAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok(asset, "Asset retrieved successfully."));
    }

    [HttpPost("laptops")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> CreateLaptop(
        [FromBody] CreateLaptopRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.CreateLaptopAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(asset, "Laptop created successfully."));
    }

    [HttpPost("desktops")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> CreateDesktopPc(
        [FromBody] CreateDesktopPcRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.CreateDesktopPcAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(asset, "Desktop PC created successfully."));
    }

    [HttpPost("monitors")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> CreateMonitor(
        [FromBody] CreateMonitorRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.CreateMonitorAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(asset, "Monitor created successfully."));
    }

    [HttpPost("docks")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> CreateDock(
        [FromBody] CreateDockRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.CreateDockAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(asset, "Dock created successfully."));
    }

    [HttpPost("keyboard-mouse-sets")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> CreateKeyboardMouseSet(
        [FromBody] CreateKeyboardMouseSetRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.CreateKeyboardMouseSetAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(asset, "Keyboard & mouse set created successfully."));
    }

    [HttpPut("laptops/{id:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> UpdateLaptop(
        Guid id, [FromBody] UpdateLaptopRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.UpdateLaptopAsync(id, request, cancellationToken);
        return Ok(ApiResponse.Ok(asset, "Laptop updated successfully."));
    }

    [HttpPut("desktops/{id:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> UpdateDesktopPc(
        Guid id, [FromBody] UpdateDesktopPcRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.UpdateDesktopPcAsync(id, request, cancellationToken);
        return Ok(ApiResponse.Ok(asset, "Desktop PC updated successfully."));
    }

    [HttpPut("monitors/{id:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> UpdateMonitor(
        Guid id, [FromBody] UpdateMonitorRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.UpdateMonitorAsync(id, request, cancellationToken);
        return Ok(ApiResponse.Ok(asset, "Monitor updated successfully."));
    }

    [HttpPut("docks/{id:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> UpdateDock(
        Guid id, [FromBody] UpdateDockRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.UpdateDockAsync(id, request, cancellationToken);
        return Ok(ApiResponse.Ok(asset, "Dock updated successfully."));
    }

    [HttpPut("keyboard-mouse-sets/{id:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> UpdateKeyboardMouseSet(
        Guid id, [FromBody] UpdateKeyboardMouseSetRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.UpdateKeyboardMouseSetAsync(id, request, cancellationToken);
        return Ok(ApiResponse.Ok(asset, "Keyboard & mouse set updated successfully."));
    }

    [HttpPost("{id:guid}/status")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<AssetDetailsDto>>> UpdateStatus(
        Guid id, [FromBody] UpdateAssetStatusRequestDto request, CancellationToken cancellationToken)
    {
        var asset = await _assetService.UpdateStatusAsync(id, request, cancellationToken);
        return Ok(ApiResponse.Ok(asset, "Asset status updated successfully."));
    }

    [HttpGet("storage")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<PagedResult<StorageDto>>>> GetStorage(
    [FromQuery] GetStorageQuery query, CancellationToken cancellationToken)
    {
        var result = await _assetService.GetStoragePagedAsync(query, cancellationToken);
        return Ok(ApiResponse.Ok(result, "Storage devices retrieved successfully."));
    }

    [HttpGet("storage/{id:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<StorageDto>>> GetStorageById(
        Guid id, CancellationToken cancellationToken)
    {
        var storage = await _assetService.GetStorageByIdAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok(storage, "Storage device retrieved successfully."));
    }


    [HttpPost("storage")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<StorageDto>>> CreateStorage(
        [FromBody] CreateStorageRequestDto request, CancellationToken cancellationToken)
    {
        var storage = await _assetService.CreateStorageAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(storage, "Storage device created successfully."));
    }

    [HttpPut("storage/{id:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<StorageDto>>> UpdateStorage(
        Guid id, [FromBody] UpdateStorageRequestDto request, CancellationToken cancellationToken)
    {
        var storage = await _assetService.UpdateStorageAsync(id, request, cancellationToken);
        return Ok(ApiResponse.Ok(storage, "Storage device updated successfully."));
    }

    [HttpDelete("storage/{id:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse>> DeleteStorage(Guid id, CancellationToken cancellationToken)
    {
        await _assetService.DeleteStorageAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok("Storage device deleted."));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse>> HardDelete(Guid id, CancellationToken cancellationToken)
    {
        await _assetService.HardDeleteAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok("Asset hard deleted with all related records."));
    }
}