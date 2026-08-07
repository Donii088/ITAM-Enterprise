namespace Itam.Application.DTOs.Auth;

public sealed record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    AuthUserDto User);