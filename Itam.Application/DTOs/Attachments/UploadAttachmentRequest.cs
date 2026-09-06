namespace Itam.Application.DTOs.Attachments;

public sealed record UploadAttachmentRequest(
    Stream Content,
    string FileName,
    string ContentType,
    long Size);