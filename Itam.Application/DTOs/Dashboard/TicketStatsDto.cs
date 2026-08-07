namespace Itam.Application.DTOs.Dashboard;

public sealed record TicketStatsDto(
    int Total,
    int Open,
    IReadOnlyList<CountDto> ByStatus,
    IReadOnlyList<CountDto> ByPriority);