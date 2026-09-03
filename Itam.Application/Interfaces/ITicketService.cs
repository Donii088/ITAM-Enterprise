using Itam.Application.Common;
using Itam.Application.DTOs.Tickets;

namespace Itam.Application.Interfaces;

public interface ITicketService
{
    Task<TicketDto> CreateAsync(CreateTicketRequestDto request, CancellationToken ct = default);
    Task<TicketDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<TicketDto>> GetMyTicketsAsync(GetTicketsQuery query, CancellationToken ct = default);
    Task<PagedResult<TicketDto>> GetPagedAsync(GetTicketsQuery query, CancellationToken ct = default);
    Task<TicketDto> CancelAsync(Guid id, CancellationToken ct = default);

    Task<TicketDto> UpdateStatusAsync(Guid id, UpdateTicketStatusRequestDto request,Guid UserId, CancellationToken ct = default);

    Task<TicketDto> UpdateStatusAsync(Guid id, UpdateTicketStatusRequestDto request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}