namespace Itam.Application.DTOs.Search;

public sealed record GetSearchQuery
{
    public string Term { get; init; } = string.Empty;
    public int Limit { get; init; } = 10;
}