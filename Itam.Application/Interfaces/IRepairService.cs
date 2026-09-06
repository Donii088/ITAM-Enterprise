using Itam.Application.Common;
using Itam.Application.DTOs.Repairs;

namespace Itam.Application.Interfaces;

public interface IRepairService
{
    Task<ResolveTicketResultDto> ResolveTicketAsync(Guid ticketId, ResolveTicketRequestDto request, CancellationToken ct = default);
    Task<IReadOnlyList<RepairHistoryDto>> GetByTicketAsync(Guid ticketId, CancellationToken ct = default);
    Task<IReadOnlyList<RepairHistoryDto>> GetByAssetAsync(Guid assetId, CancellationToken ct = default);
    Task<PagedResult<RepairHistoryDto>> GetPagedAsync(GetRepairsQuery query, CancellationToken ct = default);
}