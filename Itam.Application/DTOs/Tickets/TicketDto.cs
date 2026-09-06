using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Tickets;

public sealed record TicketDto(
    Guid Id,
    string Title,
    string Description,
    TicketPriority Priority,
    TicketStatus Status,
    Guid? EmployeeId,
    string EmployeeName,
    Guid AssetId,
    AssetType AssetType,
    string? AssetBrand,
    string? AssetModel,
    string? AssetSerial,
    DateTime CreatedAt,
    DateTime? UpdatedAt);