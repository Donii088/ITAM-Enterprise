using Itam.Domain.Enums;

namespace Itam.Domain.Entities;

public class Ticket : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public TicketStatus Status { get; set; } = TicketStatus.Open;

    public Guid EmployeeId { get; set; }
    public User Employee { get; set; } = null!;

    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;

    // Navigation Properties
    public ICollection<RepairHistory> RepairHistories { get; set; } = new List<RepairHistory>();
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}