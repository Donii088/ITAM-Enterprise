namespace Itam.Application.DTOs.Assignments;

public sealed record GetAssignmentsQuery
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public Guid? EmployeeId { get; init; }
    public Guid? AssetId { get; init; }
    /// <summary>Null returns both active and ended assignments; true/false filters to one or the other.</summary>
    public bool? ActiveOnly { get; init; }
    public string? SearchTerm { get; init; }
}