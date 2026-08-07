// CreateMonitorRequestDto.cs
namespace Itam.Application.DTOs.Assets;

public sealed record CreateMonitorRequestDto(
    string Brand, string Resolution, int RefreshRate, double Size);