using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Users;

public sealed record UpdateUserRequestDto(
    string FirstName,
    string LastName,
    string Email,
    string JobTitle,
    Role Role,
    string? NewPassword = null);