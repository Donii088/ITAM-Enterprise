namespace Itam.Domain.Entities;

public class RepairHistory : BaseEntity
{
    public string RepairDescription { get; set; } = string.Empty;
    public DateTime RepairDate { get; set; }

    public Guid TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;

    // Nullable so a hard-deleted admin's repair history can be preserved (anonymized) instead of
    // blocking deletion or being cascade-deleted.
    public Guid? AdminId { get; set; }
    public User? Admin { get; set; }

    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}