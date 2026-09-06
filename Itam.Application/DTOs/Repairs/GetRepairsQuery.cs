namespace Itam.Application.DTOs.Repairs;

public sealed record GetRepairsQuery
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public Guid? AssetId { get; init; }
    public Guid? TicketId { get; init; }
    public Guid? AdminId { get; init; }
    public string? SearchTerm { get; init; }
}