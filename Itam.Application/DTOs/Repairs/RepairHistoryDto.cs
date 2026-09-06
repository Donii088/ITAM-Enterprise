using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Repairs;

public sealed record RepairHistoryDto(
    Guid Id,
    Guid TicketId,
    string TicketTitle,
    Guid AssetId,
    AssetType AssetType,
    string? AssetBrand,
    string? AssetModel,
    string? AssetSerial,
    Guid? AdminId,
    string AdminName,
    string RepairDescription,
    DateTime RepairDate,
    DateTime CreatedAt);