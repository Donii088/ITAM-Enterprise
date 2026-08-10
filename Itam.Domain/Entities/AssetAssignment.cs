namespace Itam.Domain.Entities;

public class AssetAssignment : BaseEntity
{
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;

    // Nullable so a hard-deleted employee's assignment history can be preserved (anonymized)
    // instead of being blocked or cascade-deleted. Active assignments always have an employee;
    // enforced by UserService.HardDeleteAsync refusing to delete a user with an active assignment.
    public Guid? EmployeeId { get; set; }
    public User? Employee { get; set; }

    public DateTime AssignedAt { get; set; }
    public DateTime? UnassignedAt { get; set; }
}