using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Assignments;

public sealed record AssignmentDto(
    Guid Id,
    Guid AssetId,
    AssetType AssetType,
    string? AssetBrand,
    string? AssetModel,
    string? AssetSerial,
    Guid? EmployeeId,
    string EmployeeName,
    DateTime AssignedAt,
    DateTime? UnassignedAt,
    bool IsActive);