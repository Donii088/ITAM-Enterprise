using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Users;

public sealed record CreateUserRequestDto(
    string FirstName,
    string LastName,
    string Email,
    string JobTitle,
    Role Role,
    string Password);