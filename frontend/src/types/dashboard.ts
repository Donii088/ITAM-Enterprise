import type { AssetType } from './enums';
import type { AssetListItem } from './assets';
import type { Ticket } from './tickets';

export interface CountItem {
  name: string;
  count: number;
}

export interface AssetStats {
  total: number;
  byType: CountItem[];
  byStatus: CountItem[];
}

export interface StorageStats {
  total: number;
  unassigned: number;
}

export interface PeopleStats {
  total: number;
  active: number;
  inactive: number;
}

export interface TicketStats {
  total: number;
  open: number;
  byStatus: CountItem[];
  byPriority: CountItem[];
}

export interface RepairStats {
  total: number;
  last30Days: number;
}

export interface TopAsset {
  assetId: string;
  assetType: AssetType;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  count: number;
}

export interface DashboardOverview {
  assets: AssetStats;
  storage: StorageStats;
  people: PeopleStats;
  tickets: TicketStats;
  repairs: RepairStats;
  mostRepairedAssets: TopAsset[];
  mostTicketedAssets: TopAsset[];
}

export interface MyDashboard {
  assignedAssetsCount: number;
  assignedAssets: AssetListItem[];
  openTicketsCount: number;
  recentTickets: Ticket[];
}
