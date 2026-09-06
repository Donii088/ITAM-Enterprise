namespace Itam.Application.DTOs.Auth;

public sealed record ChangePasswordRequestDto(string CurrentPassword, string NewPassword);
