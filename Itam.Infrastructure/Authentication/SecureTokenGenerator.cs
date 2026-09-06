using System.Security.Cryptography;
using Itam.Application.Interfaces;

namespace Itam.Infrastructure.Authentication;

public sealed class SecureTokenGenerator : ISecureTokenGenerator
{
    public string Generate(int byteLength = 64)
    {
        var randomBytes = RandomNumberGenerator.GetBytes(byteLength);

        return Convert.ToBase64String(randomBytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }
}