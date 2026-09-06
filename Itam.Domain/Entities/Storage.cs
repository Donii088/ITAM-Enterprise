using Itam.Domain.Enums;

namespace Itam.Domain.Entities;

public class Storage : BaseEntity
{
    public string SerialNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public StorageType StorageType { get; set; }
    public StorageUnit StorageUnit { get; set; }

    // Mutually exclusive Foreign Keys
    public Guid? LaptopId { get; set; }
    public Laptop? Laptop { get; set; }

    public Guid? DesktopPcId { get; set; }
    public DesktopPc? DesktopPc { get; set; }
}