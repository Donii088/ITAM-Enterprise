import type { AssetType, TicketPriority, TicketStatus } from './enums';
import type { PagedQuery } from './api';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  employeeId: string;
  employeeName: string;
  assetId: string;
  assetType: AssetType;
  assetBrand: string | null;
  assetModel: string | null;
  assetSerial: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  assetId: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface GetTicketsQuery extends PagedQuery {
  status?: TicketStatus;
  priority?: TicketPriority;
  employeeId?: string;
  assetId?: string;
  searchTerm?: string;
}
