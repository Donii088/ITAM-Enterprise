namespace Itam.Application.Common;

public sealed class FileStorageSettings
{
    public const string SectionName = "FileStorageSettings";

    public string RootFolder { get; init; } = "uploads";
    public long MaxFileSizeBytes { get; init; } = 5 * 1024 * 1024;

    // Intentionally has no non-empty default: ConfigurationBinder appends bound array items to any
    // preexisting default array instead of replacing it, which previously caused every entry in
    // appsettings.json's FileStorageSettings:AllowedExtensions to appear twice (e.g. in validation
    // error messages). The list is always supplied by configuration, so an empty default is correct.
    public string[] AllowedExtensions { get; init; } = Array.Empty<string>();
}