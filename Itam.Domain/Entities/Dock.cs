namespace Itam.Domain.Entities;

public class Dock : Asset
{
    // Optional — unlike Laptop/DesktopPc, docks aren't always individually serialized/tracked.
    public string? SerialNumber { get; set; }
    public string Brand { get; set; } = string.Empty;
}