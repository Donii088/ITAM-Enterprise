namespace Itam.Application.DTOs.Assignments;

public sealed record CreateAssignmentRequestDto(Guid AssetId, Guid EmployeeId);