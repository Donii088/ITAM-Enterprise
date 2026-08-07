using Itam.Application.Interfaces;
using BCryptImpl = BCrypt.Net.BCrypt;

namespace Itam.Infrastructure.Authentication;

public sealed class PasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string Hash(string password)
        => BCryptImpl.EnhancedHashPassword(password, WorkFactor);

    public bool Verify(string password, string passwordHash)
        => BCryptImpl.EnhancedVerify(password, passwordHash);
}