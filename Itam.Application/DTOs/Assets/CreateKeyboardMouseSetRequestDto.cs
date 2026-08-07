// CreateKeyboardMouseSetRequestDto.cs
using Itam.Domain.Enums;
namespace Itam.Application.DTOs.Assets;

public sealed record CreateKeyboardMouseSetRequestDto(string Brand, ConnectionType ConnectionType);