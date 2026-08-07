using Itam.Domain.Entities;

namespace Itam.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user);
}