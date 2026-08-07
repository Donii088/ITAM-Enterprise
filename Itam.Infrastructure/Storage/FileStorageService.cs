using Itam.Application.Common;
using Itam.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Itam.Infrastructure.Files;

public sealed class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly FileStorageSettings _settings;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(
        IWebHostEnvironment environment,
        IOptions<FileStorageSettings> settings,
        ILogger<FileStorageService> logger)
    {
        _environment = environment;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<string> SaveAsync(Stream content, string subFolder, string fileName, CancellationToken ct = default)
    {
        var relativeDirectory = Path.Combine(_settings.RootFolder, subFolder);
        var absoluteDirectory = Path.Combine(_environment.ContentRootPath, relativeDirectory);

        Directory.CreateDirectory(absoluteDirectory);

        var absolutePath = Path.Combine(absoluteDirectory, fileName);

        // Last argument is 'useAsync: true' — this FileStream overload has no CancellationToken.
        await using var target = new FileStream(
            absolutePath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 4096, true);

        await content.CopyToAsync(target, ct);

        _logger.LogInformation("File saved to {Path}.", absolutePath);

        return Path.Combine(relativeDirectory, fileName).Replace('\\', '/');
    }

    public string GetFullPath(string relativePath)
    {
        var safeRelative = relativePath.Replace('/', Path.DirectorySeparatorChar);
        return Path.Combine(_environment.ContentRootPath, safeRelative);
    }

    public Task DeleteAsync(string relativePath, CancellationToken ct = default)
    {
        var fullPath = GetFullPath(relativePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("Physical file deleted: {Path}.", fullPath);
        }

        return Task.CompletedTask;
    }
}