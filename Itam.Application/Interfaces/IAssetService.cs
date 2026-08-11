using Itam.Application.Common;
using Itam.Application.DTOs.Assets;

namespace Itam.Application.Interfaces;

public interface IAssetService
{
    Task<AssetDetailsDto> CreateLaptopAsync(CreateLaptopRequestDto request, CancellationToken ct = default);
    Task<AssetDetailsDto> CreateDesktopPcAsync(CreateDesktopPcRequestDto request, CancellationToken ct = default);
    Task<AssetDetailsDto> CreateMonitorAsync(CreateMonitorRequestDto request, CancellationToken ct = default);
    Task<AssetDetailsDto> CreateDockAsync(CreateDockRequestDto request, CancellationToken ct = default);
    Task<AssetDetailsDto> CreateKeyboardMouseSetAsync(CreateKeyboardMouseSetRequestDto request, CancellationToken ct = default);

    Task<AssetDetailsDto> UpdateLaptopAsync(Guid id, UpdateLaptopRequestDto request, CancellationToken ct = default);
    Task<AssetDetailsDto> UpdateDesktopPcAsync(Guid id, UpdateDesktopPcRequestDto request, CancellationToken ct = default);
    Task<AssetDetailsDto> UpdateMonitorAsync(Guid id, UpdateMonitorRequestDto request, CancellationToken ct = default);
    Task<AssetDetailsDto> UpdateDockAsync(Guid id, UpdateDockRequestDto request, CancellationToken ct = default);
    Task<AssetDetailsDto> UpdateKeyboardMouseSetAsync(Guid id, UpdateKeyboardMouseSetRequestDto request, CancellationToken ct = default);

    Task<AssetDetailsDto> GetDetailsAsync(Guid id, CancellationToken ct = default);
    /// <summary>
    /// Same as <see cref="GetDetailsAsync"/> but enforces that a non-admin caller may only view
    /// an asset that is (or has been) assigned to them.
    /// </summary>
    Task<AssetDetailsDto> GetDetailsForViewerAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<AssetListItemDto>> GetPagedAsync(GetAssetsQuery query, CancellationToken ct = default);
    Task<AssetDetailsDto> UpdateStatusAsync(Guid id, UpdateAssetStatusRequestDto request, CancellationToken ct = default);
    Task HardDeleteAsync(Guid id, CancellationToken ct = default);

    Task<StorageDto> CreateStorageAsync(CreateStorageRequestDto request, CancellationToken ct = default);
    Task<StorageDto> GetStorageByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<StorageDto>> GetStoragePagedAsync(GetStorageQuery query, CancellationToken ct = default);
    Task<StorageDto> UpdateStorageAsync(Guid id, UpdateStorageRequestDto request, CancellationToken ct = default);
    Task DeleteStorageAsync(Guid id, CancellationToken ct = default);
}