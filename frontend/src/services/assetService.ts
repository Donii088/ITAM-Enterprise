import { apiClient, unwrapResponse } from '@/lib/api-client';
import { pruneEmpty } from '@/lib/utils';
import type {
  AssetDetails,
  AssetListItem,
  AssetType,
  CreateDesktopPcRequest,
  CreateDockRequest,
  CreateKeyboardMouseSetRequest,
  CreateLaptopRequest,
  CreateMonitorRequest,
  CreateStorageRequest,
  GetAssetsQuery,
  GetStorageQuery,
  PagedResult,
  StorageDevice,
  UpdateAssetStatusRequest,
  UpdateDesktopPcRequest,
  UpdateDockRequest,
  UpdateKeyboardMouseSetRequest,
  UpdateLaptopRequest,
  UpdateMonitorRequest,
  UpdateStorageRequest,
} from '@/types';

const CREATE_PATH_BY_TYPE: Record<AssetType, string> = {
  Laptop: '/assets/laptops',
  DesktopPc: '/assets/desktops',
  Monitor: '/assets/monitors',
  Dock: '/assets/docks',
  KeyboardMouseSet: '/assets/keyboard-mouse-sets',
};

export const assetService = {
  getPaged: (query: GetAssetsQuery) =>
    unwrapResponse<PagedResult<AssetListItem>>(apiClient.get('/assets', { params: pruneEmpty(query) })),

  getById: (id: string) => unwrapResponse<AssetDetails>(apiClient.get(`/assets/${id}`)),

  createLaptop: (payload: CreateLaptopRequest) =>
    unwrapResponse<AssetDetails>(apiClient.post(CREATE_PATH_BY_TYPE.Laptop, payload)),
  createDesktopPc: (payload: CreateDesktopPcRequest) =>
    unwrapResponse<AssetDetails>(apiClient.post(CREATE_PATH_BY_TYPE.DesktopPc, payload)),
  createMonitor: (payload: CreateMonitorRequest) =>
    unwrapResponse<AssetDetails>(apiClient.post(CREATE_PATH_BY_TYPE.Monitor, payload)),
  createDock: (payload: CreateDockRequest) =>
    unwrapResponse<AssetDetails>(apiClient.post(CREATE_PATH_BY_TYPE.Dock, payload)),
  createKeyboardMouseSet: (payload: CreateKeyboardMouseSetRequest) =>
    unwrapResponse<AssetDetails>(apiClient.post(CREATE_PATH_BY_TYPE.KeyboardMouseSet, payload)),

  updateLaptop: (id: string, payload: UpdateLaptopRequest) =>
    unwrapResponse<AssetDetails>(apiClient.put(`/assets/laptops/${id}`, payload)),
  updateDesktopPc: (id: string, payload: UpdateDesktopPcRequest) =>
    unwrapResponse<AssetDetails>(apiClient.put(`/assets/desktops/${id}`, payload)),
  updateMonitor: (id: string, payload: UpdateMonitorRequest) =>
    unwrapResponse<AssetDetails>(apiClient.put(`/assets/monitors/${id}`, payload)),
  updateDock: (id: string, payload: UpdateDockRequest) =>
    unwrapResponse<AssetDetails>(apiClient.put(`/assets/docks/${id}`, payload)),
  updateKeyboardMouseSet: (id: string, payload: UpdateKeyboardMouseSetRequest) =>
    unwrapResponse<AssetDetails>(apiClient.put(`/assets/keyboard-mouse-sets/${id}`, payload)),

  updateStatus: (id: string, payload: UpdateAssetStatusRequest) =>
    unwrapResponse<AssetDetails>(apiClient.post(`/assets/${id}/status`, payload)),

  hardDelete: (id: string) => unwrapResponse<void>(apiClient.delete(`/assets/${id}`)),

  getStoragePaged: (query: GetStorageQuery) =>
    unwrapResponse<PagedResult<StorageDevice>>(apiClient.get('/assets/storage', { params: pruneEmpty(query) })),
  getStorageById: (id: string) => unwrapResponse<StorageDevice>(apiClient.get(`/assets/storage/${id}`)),
  createStorage: (payload: CreateStorageRequest) =>
    unwrapResponse<StorageDevice>(apiClient.post('/assets/storage', payload)),
  updateStorage: (id: string, payload: UpdateStorageRequest) =>
    unwrapResponse<StorageDevice>(apiClient.put(`/assets/storage/${id}`, payload)),
  deleteStorage: (id: string) => unwrapResponse<void>(apiClient.delete(`/assets/storage/${id}`)),
};

export function createAssetForType(assetType: AssetType, payload: Record<string, unknown>) {
  switch (assetType) {
    case 'Laptop':
      return assetService.createLaptop(payload as unknown as CreateLaptopRequest);
    case 'DesktopPc':
      return assetService.createDesktopPc(payload as unknown as CreateDesktopPcRequest);
    case 'Monitor':
      return assetService.createMonitor(payload as unknown as CreateMonitorRequest);
    case 'Dock':
      return assetService.createDock(payload as unknown as CreateDockRequest);
    case 'KeyboardMouseSet':
      return assetService.createKeyboardMouseSet(payload as unknown as CreateKeyboardMouseSetRequest);
  }
}

export function updateAssetForType(assetType: AssetType, id: string, payload: Record<string, unknown>) {
  switch (assetType) {
    case 'Laptop':
      return assetService.updateLaptop(id, payload as unknown as UpdateLaptopRequest);
    case 'DesktopPc':
      return assetService.updateDesktopPc(id, payload as unknown as UpdateDesktopPcRequest);
    case 'Monitor':
      return assetService.updateMonitor(id, payload as unknown as UpdateMonitorRequest);
    case 'Dock':
      return assetService.updateDock(id, payload as unknown as UpdateDockRequest);
    case 'KeyboardMouseSet':
      return assetService.updateKeyboardMouseSet(id, payload as unknown as UpdateKeyboardMouseSetRequest);
  }
}
