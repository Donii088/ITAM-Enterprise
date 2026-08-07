namespace Itam.Domain.Entities;

public class DesktopPc : Asset
{
    public string SerialNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string CPU { get; set; } = string.Empty;
    public string GPU { get; set; } = string.Empty;
    public int RAM { get; set; }

    public ICollection<Storage> StorageDevices { get; set; } = new List<Storage>();
}