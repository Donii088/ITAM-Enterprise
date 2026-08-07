namespace Itam.Application.DTOs.Dashboard;

public sealed record DashboardOverviewDto(
    AssetStatsDto Assets,
    StorageStatsDto Storage,
    PeopleStatsDto People,
    TicketStatsDto Tickets,
    RepairStatsDto Repairs,
    IReadOnlyList<TopAssetDto> MostRepairedAssets,
    IReadOnlyList<TopAssetDto> MostTicketedAssets);