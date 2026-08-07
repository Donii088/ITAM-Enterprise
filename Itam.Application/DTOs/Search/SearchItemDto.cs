namespace Itam.Application.DTOs.Search;

public sealed record SearchItemDto(
    Guid Id,
    string Type,
    string Title,
    string? Subtitle,
    string? Status);