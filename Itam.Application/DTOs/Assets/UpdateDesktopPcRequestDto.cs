namespace Itam.Application.DTOs.Assets;

public sealed record UpdateDesktopPcRequestDto(
    string SerialNumber, string Brand, string Model, string Cpu, string Gpu, int Ram);