namespace Itam.Application.DTOs.Assets;

public sealed record CreateDesktopPcRequestDto(
    string SerialNumber, string Brand, string Model, string Cpu, string Gpu, int Ram);