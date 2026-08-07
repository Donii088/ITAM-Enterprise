using Itam.Application.DTOs.Tickets;

namespace Itam.Application.DTOs.Repairs;

public sealed record ResolveTicketResultDto(TicketDto Ticket, RepairHistoryDto Repair);