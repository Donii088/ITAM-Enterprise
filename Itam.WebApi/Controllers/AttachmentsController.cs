
using Itam.Application.DTOs.Attachments;
using Itam.Application.Interfaces;
using Itam.Application.Responses;
using Itam.Domain.Constants;
using Itam.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itam.WebApi.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public sealed class AttachmentsController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;

    public AttachmentsController(IAttachmentService attachmentService)
    {
        _attachmentService = attachmentService;
    }

    [HttpPost("tickets/{id:guid}/attachments")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<AttachmentDto>>> UploadForTicket(
        Guid id, IFormFile file,Guid userId ,CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse.Fail("File missing!"));
        }

        using var stream = file.OpenReadStream();
        var request = new UploadAttachmentRequest(stream, file.FileName, file.ContentType, file.Length);
        var dto = await _attachmentService.UploadForTicketAsync(id, request,userId , cancellationToken);

        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(dto, "File uploaded successfully."));
    }

    [HttpPost("repairs/{id:guid}/attachments")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<AttachmentDto>>> UploadForRepair(
        Guid id, IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse.Fail("File missing!"));
        }

        using var stream = file.OpenReadStream();
        var request = new UploadAttachmentRequest(stream, file.FileName, file.ContentType, file.Length);
        var dto = await _attachmentService.UploadForRepairAsync(id, request, cancellationToken);

        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(dto, "File uploaded successfully."));
    }

    [HttpPost("assets/{id:guid}/attachments")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<AttachmentDto>>> UploadForAsset(
        Guid id, IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse.Fail("File missing!"));
        }

        using var stream = file.OpenReadStream();
        var request = new UploadAttachmentRequest(stream, file.FileName, file.ContentType, file.Length);

        var dto = await _attachmentService.UploadForAssetAsync(id, request, cancellationToken);


        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(dto, "File uploaded successfully."));
    }




    [HttpGet("attachments/ticket/{ticketId:guid}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AttachmentDto>>>> GetByTicket(
        Guid ticketId, CancellationToken cancellationToken)
    {
        var items = await _attachmentService.GetByTicketAsync(ticketId, cancellationToken);
        return Ok(ApiResponse.Ok(items, "Attachments retrieved successfully."));
    }

    [HttpGet("attachments/repair/{repairId:guid}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AttachmentDto>>>> GetByRepair(
        Guid repairId, CancellationToken cancellationToken)
    {
        var items = await _attachmentService.GetByRepairAsync(repairId, cancellationToken);
        return Ok(ApiResponse.Ok(items, "Attachments retrieved successfully."));
    }

    [HttpGet("attachments/asset/{assetId:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AttachmentDto>>>> GetByAsset(
        Guid assetId, CancellationToken cancellationToken)
    {
        var items = await _attachmentService.GetByAssetAsync(assetId, cancellationToken);
        return Ok(ApiResponse.Ok(items, "Attachments retrieved successfully."));
    }

    [HttpGet("attachments/{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
    {
        var file = await _attachmentService.GetForDownloadAsync(id, cancellationToken);

        if (file == null)
        {
            return NotFound(ApiResponse.Fail("Attachment metadata not found."));
        }

        if (!System.IO.File.Exists(file.FullPath))
        {
            return NotFound(ApiResponse.Fail("The physical file was not found on the server."));
        }

        return PhysicalFile(file.FullPath, file.Meta.ContentType, $"{file.Meta.FileName}{file.Meta.FileExtension}");
    }

    [HttpDelete("attachments/{id:guid}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _attachmentService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok("Attachment deleted."));
    }
}