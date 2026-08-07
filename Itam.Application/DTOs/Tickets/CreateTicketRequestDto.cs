using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Tickets;

public sealed record CreateTicketRequestDto(
    string Title,
    string Description,
    TicketPriority Priority,
    Guid AssetId);