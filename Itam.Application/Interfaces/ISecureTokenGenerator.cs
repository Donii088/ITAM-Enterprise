namespace Itam.Application.Interfaces;

public interface ISecureTokenGenerator
{
    string Generate(int byteLength = 64);
}