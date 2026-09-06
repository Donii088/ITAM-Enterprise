namespace Itam.Application.DTOs.Auth;

public sealed record AuthUserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string JobTitle,
    string Role);