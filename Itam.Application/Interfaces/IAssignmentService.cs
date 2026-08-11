using Itam.Application.Common;
using Itam.Application.DTOs.Assignments;

namespace Itam.Application.Interfaces;

public interface IAssignmentService
{
    Task<AssignmentDto> AssignAsync(CreateAssignmentRequestDto request, CancellationToken ct = default);
    Task<AssignmentDto> UnassignAsync(Guid assignmentId, CancellationToken ct = default);
    Task<AssignmentDto> UnassignByAssetAsync(Guid assetId, CancellationToken ct = default);
    Task<IReadOnlyList<AssignmentDto>> GetMyAssetsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AssignmentDto>> GetAssetHistoryAsync(Guid assetId, CancellationToken ct = default);
    Task<PagedResult<AssignmentDto>> GetPagedAsync(GetAssignmentsQuery query, CancellationToken ct = default);
}