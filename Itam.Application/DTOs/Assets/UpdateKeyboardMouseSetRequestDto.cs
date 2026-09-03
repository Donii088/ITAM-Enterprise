using Itam.Domain.Enums;
namespace Itam.Application.DTOs.Assets;

public sealed record UpdateKeyboardMouseSetRequestDto(string? SerialNumber, string Brand, ConnectionType ConnectionType);
