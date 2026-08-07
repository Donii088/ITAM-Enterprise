namespace Itam.Application.Common;

public sealed class FileStorageSettings
{
    public const string SectionName = "FileStorageSettings";

    public string RootFolder { get; init; } = "uploads";
    public long MaxFileSizeBytes { get; init; } = 5 * 1024 * 1024;
    public string[] AllowedExtensions { get; init; } = { ".jpg", ".jpeg", ".png", ".pdf" };
}