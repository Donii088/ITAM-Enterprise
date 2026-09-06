namespace Itam.Application.DTOs.Assets;

public sealed record UpdateMonitorRequestDto(
    string? SerialNumber, string Brand, string Resolution, int RefreshRate, double Size);
