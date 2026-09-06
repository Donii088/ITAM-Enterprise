namespace Itam.Application.DTOs.Assets;

public sealed record CreateLaptopRequestDto(
    string SerialNumber, string Brand, string Model, string Cpu, string Gpu, int Ram);