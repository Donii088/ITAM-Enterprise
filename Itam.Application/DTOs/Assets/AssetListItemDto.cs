// AssetListItemDto.cs
using Itam.Domain.Enums;
namespace Itam.Application.DTOs.Assets;

public sealed record AssetListItemDto(
    Guid Id,
    AssetType AssetType,
    AssetStatus Status,
    string? Brand,
    string? Model,
    string? SerialNumber,
    string? AssignedEmployeeName,
    DateTime CreatedAt);