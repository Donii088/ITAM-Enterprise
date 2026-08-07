using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Tickets;

public sealed record UpdateTicketStatusRequestDto(TicketStatus Status);