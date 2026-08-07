namespace Itam.Application.DTOs.Assignments;

public sealed record GetAssignmentsQuery
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public Guid? EmployeeId { get; init; }
    public Guid? AssetId { get; init; }
    public bool ActiveOnly { get; init; }
}