import type { AssetStatus, AssetType, ConnectionType, StorageType, StorageUnit } from './enums';
import type { PagedQuery } from './api';

export interface AssetAssignmentSummary {
  assignmentId: string;
  employeeId: string;
  employeeName: string;
  assignedAt: string;
}

export interface StorageDevice {
  id: string;
  serialNumber: string;
  capacity: number;
  storageType: StorageType;
  storageUnit: StorageUnit;
  laptopId: string | null;
  desktopPcId: string | null;
}

export interface AssetListItem {
  id: string;
  assetType: AssetType;
  status: AssetStatus;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  assignedEmployeeName: string | null;
  createdAt: string;
}

export interface AssetDetails {
  id: string;
  assetType: AssetType;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string | null;
  serialNumber: string | null;
  brand: string | null;
  model: string | null;
  cpu: string | null;
  gpu: string | null;
  ram: number | null;
  resolution: string | null;
  refreshRate: number | null;
  size: number | null;
  connectionType: ConnectionType | null;
  storageDevices: StorageDevice[];
  currentAssignment: AssetAssignmentSummary | null;
}

export interface GetAssetsQuery extends PagedQuery {
  assetType?: AssetType;
  status?: AssetStatus;
  searchTerm?: string;
}

export interface GetStorageQuery extends PagedQuery {
  storageType?: StorageType;
  unassignedOnly?: boolean;
  searchTerm?: string;
}

export interface CreateLaptopRequest {
  serialNumber: string;
  brand: string;
  model: string;
  cpu: string;
  gpu: string;
  ram: number;
}
export type UpdateLaptopRequest = CreateLaptopRequest;

export interface CreateDesktopPcRequest {
  serialNumber: string;
  brand: string;
  model: string;
  cpu: string;
  gpu: string;
  ram: number;
}
export type UpdateDesktopPcRequest = CreateDesktopPcRequest;

export interface CreateMonitorRequest {
  brand: string;
  resolution: string;
  refreshRate: number;
  size: number;
}
export type UpdateMonitorRequest = CreateMonitorRequest;

export interface CreateDockRequest {
  brand: string;
}
export type UpdateDockRequest = CreateDockRequest;

export interface CreateKeyboardMouseSetRequest {
  brand: string;
  connectionType: ConnectionType;
}
export type UpdateKeyboardMouseSetRequest = CreateKeyboardMouseSetRequest;

export interface CreateStorageRequest {
  serialNumber: string;
  capacity: number;
  storageType: StorageType;
  storageUnit: StorageUnit;
  laptopId?: string | null;
  desktopPcId?: string | null;
}
export type UpdateStorageRequest = CreateStorageRequest;

export interface UpdateAssetStatusRequest {
  status: AssetStatus;
}
