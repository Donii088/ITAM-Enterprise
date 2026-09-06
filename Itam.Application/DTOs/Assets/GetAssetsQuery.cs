using Itam.Domain.Enums;
namespace Itam.Application.DTOs.Assets;

public sealed record GetAssetsQuery
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public AssetType? AssetType { get; init; }
    public AssetStatus? Status { get; init; }
    public string? SearchTerm { get; init; }
}