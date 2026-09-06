using Itam.Domain.Entities;

namespace Itam.Application.Common;

public static class AssetSummaries
{
    public static (string? Brand, string? Model, string? SerialNumber) Summarize(Asset asset)
        => asset switch
        {
            Laptop l => (l.Brand, l.Model, l.SerialNumber),
            DesktopPc p => (p.Brand, p.Model, p.SerialNumber),
            Monitor m => (m.Brand, m.Resolution, m.SerialNumber),
            Dock d => (d.Brand, null, d.SerialNumber),
            KeyboardMouseSet k => (k.Brand, null, k.SerialNumber),
            Headset h => (h.Brand, null, h.SerialNumber),
            _ => (null, null, null)
        };
}