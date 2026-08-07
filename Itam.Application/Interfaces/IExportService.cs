using Itam.Application.DTOs.Assets;
using Itam.Application.DTOs.Assignments;

namespace Itam.Application.Interfaces;

public interface IExportService
{
    Task<(byte[] Content, string FileName)> ExportAssetsAsync(GetAssetsQuery query, CancellationToken ct = default);
    Task<(byte[] Content, string FileName)> ExportAssignmentsAsync(GetAssignmentsQuery query, CancellationToken ct = default);
}