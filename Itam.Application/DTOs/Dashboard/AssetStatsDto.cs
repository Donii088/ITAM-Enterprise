namespace Itam.Application.DTOs.Dashboard;

public sealed record AssetStatsDto(
    int Total,
    IReadOnlyList<CountDto> ByType,
    IReadOnlyList<CountDto> ByStatus);