using Itam.Domain.Enums;
namespace Itam.Application.DTOs.Assets;

public sealed record CreateHeadsetRequestDto(string? SerialNumber, string Brand, ConnectionType ConnectionType);
