using Itam.Domain.Enums;

namespace Itam.Application.DTOs.Users;

public sealed record GetUsersQuery
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public Role? Role { get; init; }
    public bool IncludeInactive { get; init; }
}