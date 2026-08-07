// UpdateMonitorRequestDto.cs
namespace Itam.Application.DTOs.Assets;

public sealed record UpdateMonitorRequestDto(
    string Brand, string Resolution, int RefreshRate, double Size);