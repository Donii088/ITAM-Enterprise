// UpdateLaptopRequestDto.cs
namespace Itam.Application.DTOs.Assets;

public sealed record UpdateLaptopRequestDto(
    string SerialNumber, string Brand, string Model, string Cpu, string Gpu, int Ram);