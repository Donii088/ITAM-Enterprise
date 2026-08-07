using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Assets;

public sealed record GetStorageQuery
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public StorageType? StorageType { get; init; }
    public bool UnassignedOnly { get; init; }
    public string? SearchTerm { get; init; }
}