using Itam.Application.Common;
using Itam.Application.DTOs.Users;

namespace Itam.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> CreateAsync(CreateUserRequestDto request, CancellationToken cancellationToken = default);
    Task<UserDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResult<UserDto>> GetPagedAsync(GetUsersQuery query, CancellationToken cancellationToken = default);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserRequestDto request, CancellationToken cancellationToken = default);
    Task<UserDto> DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UserDto> ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task HardDeleteAsync(Guid id, CancellationToken cancellationToken = default);
}