using Itam.Application.Common;
using Itam.Application.DTOs.Repairs;
using Itam.Application.DTOs.Tickets;
using Itam.Application.Interfaces;
using Itam.Application.Responses;
using Itam.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Itam.WebApi.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public sealed class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly IRepairService _repairService;
    private readonly ICurrentUserService _currentUserService;

    public TicketsController(ITicketService ticketService, IRepairService repairService, ICurrentUserService currentUserService)
    {
        _ticketService = ticketService;
        _repairService = repairService;
        _currentUserService = currentUserService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TicketDto>>> Create(
        [FromBody] CreateTicketRequestDto request,
        CancellationToken cancellationToken)
    {
        var ticket = await _ticketService.CreateAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(ticket, "Ticket created successfully."));
    }

    [HttpPost("{id:guid}/resolve")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<ResolveTicketResultDto>>> Resolve(
    Guid id,
    [FromBody] ResolveTicketRequestDto request,
    CancellationToken cancellationToken)
    {
        var result = await _repairService.ResolveTicketAsync(id, request, cancellationToken);
        return Ok(ApiResponse.Ok(result, "Ticket resolved and repair history recorded."));
    }

    [HttpGet("my-tickets")]
    public async Task<ActionResult<ApiResponse<PagedResult<TicketDto>>>> GetMyTickets(
        [FromQuery] GetTicketsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _ticketService.GetMyTicketsAsync(query, cancellationToken);
        return Ok(ApiResponse.Ok(result, "Your tickets retrieved successfully."));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TicketDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var ticket = await _ticketService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok(ticket, "Ticket retrieved successfully."));
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<ApiResponse<TicketDto>>> Cancel(Guid id, CancellationToken cancellationToken)
    {
        var ticket = await _ticketService.CancelAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok(ticket, "Ticket cancelled successfully."));
    }

    [HttpGet]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<PagedResult<TicketDto>>>> Get(
        [FromQuery] GetTicketsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _ticketService.GetPagedAsync(query, cancellationToken);
        return Ok(ApiResponse.Ok(result, "Tickets retrieved successfully."));
    }

    [HttpPost("{id:guid}/status")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse<TicketDto>>> UpdateStatus(
        Guid id,
        [FromBody] UpdateTicketStatusRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? throw new Exception("User is not logged in!");


        var ticket = await _ticketService.UpdateStatusAsync(id, request, userId , cancellationToken);

        
        return Ok(ApiResponse.Ok(ticket, "Ticket status updated successfully."));
    }


    [HttpDelete("{id:guid}")]
    [Authorize(Roles = RoleConstants.ItAdmin)]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _ticketService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok("Ticket deleted."));
    }
}
