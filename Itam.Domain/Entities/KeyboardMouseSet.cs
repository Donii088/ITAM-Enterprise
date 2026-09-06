using Itam.Domain.Enums;

namespace Itam.Domain.Entities;

public class KeyboardMouseSet : Asset
{
    // Optional — unlike Laptop/DesktopPc, keyboard/mouse sets aren't always individually
    // serialized/tracked.
    public string? SerialNumber { get; set; }
    public string Brand { get; set; } = string.Empty;
    public ConnectionType ConnectionType { get; set; }
}