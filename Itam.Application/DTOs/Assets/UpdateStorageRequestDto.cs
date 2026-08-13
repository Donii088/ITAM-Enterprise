using Itam.Domain.Enums;
namespace Itam.Application.DTOs.Assets;

public sealed record UpdateStorageRequestDto(
    string SerialNumber, int Capacity, StorageType StorageType, StorageUnit StorageUnit,
    Guid? LaptopId, Guid? DesktopPcId);