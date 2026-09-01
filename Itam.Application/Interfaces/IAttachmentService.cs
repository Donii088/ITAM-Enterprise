using Itam.Application.DTOs.Attachments;

namespace Itam.Application.Interfaces;

public interface IAttachmentService
{
    Task<AttachmentDto> UploadForTicketAsync(Guid ticketId, UploadAttachmentRequest request,Guid userId, CancellationToken ct = default);
    Task<AttachmentDto> UploadForRepairAsync(Guid repairId, UploadAttachmentRequest request, CancellationToken ct = default);
    Task<AttachmentDto> UploadForAssetAsync(Guid assetId, UploadAttachmentRequest request, CancellationToken ct = default);

    Task<IReadOnlyList<AttachmentDto>> GetByTicketAsync(Guid ticketId, CancellationToken ct = default);
    Task<IReadOnlyList<AttachmentDto>> GetByRepairAsync(Guid repairId, CancellationToken ct = default);
    Task<IReadOnlyList<AttachmentDto>> GetByAssetAsync(Guid assetId, CancellationToken ct = default);

    Task<AttachmentFileDto> GetForDownloadAsync(Guid id, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}