namespace Itam.Domain.Entities;

public class Monitor : Asset
{
    // Optional — unlike Laptop/DesktopPc, monitors aren't always individually serialized/tracked.
    public string? SerialNumber { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
    public int RefreshRate { get; set; }
    public double Size { get; set; }
}