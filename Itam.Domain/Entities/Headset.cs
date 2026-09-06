using Itam.Domain.Enums;

namespace Itam.Domain.Entities;

public class Headset : Asset
{
    // Optional — headsets aren't always individually serialized/tracked.
    public string? SerialNumber { get; set; }
    public string Brand { get; set; } = string.Empty;
    public ConnectionType ConnectionType { get; set; }
}
