namespace Itam.Application.DTOs.Attachments;

public sealed record AttachmentDto(
    Guid Id,
    string FileName,
    string FileExtension,
    long FileSize,
    string ContentType,
    Guid? TicketId,
    Guid? RepairHistoryId,
    Guid? AssetId,
    DateTime CreatedAt);