using Itam.Domain.Enums;
namespace Itam.Application.DTOs.Assets;

public sealed record StorageDto(
    Guid Id, string SerialNumber, int Capacity, StorageType StorageType, StorageUnit StorageUnit,
    Guid? LaptopId, Guid? DesktopPcId);