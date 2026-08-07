using Itam.Domain.Enums;

namespace Itam.Domain.Entities;

public class KeyboardMouseSet : Asset
{
    public string Brand { get; set; } = string.Empty;
    public ConnectionType ConnectionType { get; set; }
}