namespace Itam.Domain.Entities;

public class Monitor : Asset
{
    public string Brand { get; set; } = string.Empty;
    public string Resolution { get; set; } = string.Empty;
    public int RefreshRate { get; set; }
    public double Size { get; set; }
}