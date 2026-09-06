namespace Itam.Application.DTOs.Assets;

public sealed record CreateMonitorRequestDto(
    string? SerialNumber, string Brand, string Resolution, int RefreshRate, double Size);
