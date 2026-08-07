using System.Security.Claims;
using Itam.Application.Interfaces;
using Itam.Domain.Constants;
using Microsoft.AspNetCore.Http;

namespace Itam.Infrastructure.Authentication;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimConstants.Sub);
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public string? Email => _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimConstants.Email);

    public string? Role => _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimConstants.Role);

    public bool IsAuthenticated => UserId is not null;
}