using Itam.Application.DTOs.Assets;
using Itam.Application.DTOs.Tickets;

namespace Itam.Application.DTOs.Dashboard;

public sealed record MyDashboardDto(
    int AssignedAssetsCount,
    IReadOnlyList<AssetListItemDto> AssignedAssets,
    int OpenTicketsCount,
    IReadOnlyList<TicketDto> RecentTickets);