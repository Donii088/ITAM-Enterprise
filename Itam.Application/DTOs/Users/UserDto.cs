using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Users;

public sealed record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string JobTitle,
    Role Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    DateTime? LastLoginAt);