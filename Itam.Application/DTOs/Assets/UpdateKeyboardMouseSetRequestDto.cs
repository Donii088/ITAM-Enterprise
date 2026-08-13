using Itam.Domain.Enums;
namespace Itam.Application.DTOs.Assets;

public sealed record UpdateKeyboardMouseSetRequestDto(string Brand, ConnectionType ConnectionType);