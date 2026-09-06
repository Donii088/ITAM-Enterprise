namespace Itam.Domain.Entities;

public class Attachment : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;

    // Nullable FKs to allow attachments on multiple entity types
    public Guid? TicketId { get; set; }
    public Ticket? Ticket { get; set; }

    public Guid? RepairHistoryId { get; set; }
    public RepairHistory? RepairHistory { get; set; }

    public Guid? AssetId { get; set; }
    public Asset? Asset { get; set; }

    // Nullable so a hard-deleted user's past uploads are preserved (anonymized) instead of
    // blocking deletion or being cascade-deleted.
    public Guid? UploadedByUserId { get; set; }
    public User? UploadedBy { get; set; }
}