using Itam.Application.DTOs.Auth;

namespace Itam.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RefreshAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken = default);
    Task LogoutAsync(LogoutRequestDto request, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(ChangePasswordRequestDto request, CancellationToken cancellationToken = default);
}