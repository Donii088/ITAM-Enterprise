using Itam.Domain.Enums;
namespace Itam.Application.DTOs.Assets;

public sealed record AssetDetailsDto(
    Guid Id,
    AssetType AssetType,
    AssetStatus Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? SerialNumber,
    string? Brand,
    string? Model,
    string? Cpu,
    string? Gpu,
    int? Ram,
    string? Resolution,
    int? RefreshRate,
    double? Size,
    ConnectionType? ConnectionType,
    IReadOnlyList<StorageDto> StorageDevices,
    AssetAssignmentSummaryDto? CurrentAssignment);