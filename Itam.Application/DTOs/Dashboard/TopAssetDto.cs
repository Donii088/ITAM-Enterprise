using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Dashboard;

public sealed record TopAssetDto(
    Guid AssetId,
    AssetType AssetType,
    string? Brand,
    string? Model,
    string? SerialNumber,
    int Count);