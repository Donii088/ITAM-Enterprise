import type { AssetType } from './enums';
import type { PagedQuery } from './api';
import type { Ticket } from './tickets';

export interface RepairHistory {
  id: string;
  ticketId: string;
  ticketTitle: string;
  assetId: string;
  assetType: AssetType;
  assetBrand: string | null;
  assetModel: string | null;
  assetSerial: string | null;
  adminId: string | null;
  adminName: string;
  repairDescription: string;
  repairDate: string;
  createdAt: string;
}

export interface GetRepairsQuery extends PagedQuery {
  assetId?: string;
  ticketId?: string;
  adminId?: string;
  searchTerm?: string;
}

export interface ResolveTicketRequest {
  repairDescription: string;
}

export interface ResolveTicketResult {
  ticket: Ticket;
  repair: RepairHistory;
}
