namespace Itam.Domain.Entities;

public class AssetAssignment : BaseEntity
{
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;

    public Guid EmployeeId { get; set; }
    public User Employee { get; set; } = null!;

    public DateTime AssignedAt { get; set; }
    public DateTime? UnassignedAt { get; set; }
}