import type { AssetType } from './enums';
import type { PagedQuery } from './api';

export interface Assignment {
  id: string;
  assetId: string;
  assetType: AssetType;
  assetBrand: string | null;
  assetModel: string | null;
  assetSerial: string | null;
  employeeId: string;
  employeeName: string;
  assignedAt: string;
  unassignedAt: string | null;
  isActive: boolean;
}

export interface CreateAssignmentRequest {
  assetId: string;
  employeeId: string;
}

export interface GetAssignmentsQuery extends PagedQuery {
  employeeId?: string;
  assetId?: string;
  activeOnly?: boolean;
}
