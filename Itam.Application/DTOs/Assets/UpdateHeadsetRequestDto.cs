using Itam.Domain.Enums;
namespace Itam.Application.DTOs.Assets;

public sealed record UpdateHeadsetRequestDto(string? SerialNumber, string Brand, ConnectionType ConnectionType);
