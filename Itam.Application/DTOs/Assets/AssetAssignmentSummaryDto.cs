// AssetAssignmentSummaryDto.cs
namespace Itam.Application.DTOs.Assets;

public sealed record AssetAssignmentSummaryDto(
    Guid AssignmentId, Guid EmployeeId, string EmployeeName, DateTime AssignedAt);