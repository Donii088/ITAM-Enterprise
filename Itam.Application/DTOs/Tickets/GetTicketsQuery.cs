using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Tickets;

public sealed record GetTicketsQuery
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public TicketStatus? Status { get; init; }
    public TicketPriority? Priority { get; init; }
    public Guid? EmployeeId { get; init; }
    public Guid? AssetId { get; init; }
    public string? SearchTerm { get; init; }
}