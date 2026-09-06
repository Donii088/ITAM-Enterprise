namespace Itam.Application.DTOs.Search;

public sealed record SearchResultsDto(
    IReadOnlyList<SearchItemDto> Users,
    IReadOnlyList<SearchItemDto> Assets,
    IReadOnlyList<SearchItemDto> Tickets,
    int TotalMatches);