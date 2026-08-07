using Itam.Domain.Enums;
using System.Net.Mail;
using System.Net.Sockets;

namespace Itam.Domain.Entities;

public abstract class Asset : BaseEntity
{
    public AssetType AssetType { get; set; }
    public AssetStatus Status { get; set; } = AssetStatus.Available;

    // Navigation Properties
    public ICollection<AssetAssignment> AssetAssignments { get; set; } = new List<AssetAssignment>();
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<RepairHistory> RepairHistories { get; set; } = new List<RepairHistory>();
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}