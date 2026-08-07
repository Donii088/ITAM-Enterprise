namespace Itam.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveAsync(Stream content, string subFolder, string fileName, CancellationToken ct = default);
    string GetFullPath(string relativePath);
    Task DeleteAsync(string relativePath, CancellationToken ct = default);
}