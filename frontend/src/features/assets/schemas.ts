import { z } from 'zod';
import { CONNECTION_TYPE, STORAGE_TYPE, STORAGE_UNIT, ASSET_STATUS } from '@/types';

export const laptopSchema = z.object({
  serialNumber: z.string().trim().min(1, 'Serial number is required').max(150, 'Maximum 150 characters'),
  brand: z.string().trim().min(1, 'Brand is required').max(100, 'Maximum 100 characters'),
  model: z.string().trim().min(1, 'Model is required').max(150, 'Maximum 150 characters'),
  cpu: z.string().trim().min(1, 'CPU is required').max(150, 'Maximum 150 characters'),
  gpu: z.string().trim().min(1, 'GPU is required').max(150, 'Maximum 150 characters'),
  ram: z.coerce.number({ invalid_type_error: 'RAM is required' }).int('Must be a whole number').positive('Must be greater than 0'),
});
export type LaptopFormValues = z.infer<typeof laptopSchema>;

export const desktopPcSchema = laptopSchema;
export type DesktopPcFormValues = z.infer<typeof desktopPcSchema>;

export const monitorSchema = z.object({
  brand: z.string().trim().min(1, 'Brand is required').max(100, 'Maximum 100 characters'),
  resolution: z.string().trim().min(1, 'Resolution is required').max(50, 'Maximum 50 characters'),
  refreshRate: z.coerce.number({ invalid_type_error: 'Refresh rate is required' }).int().positive('Must be greater than 0'),
  size: z.coerce.number({ invalid_type_error: 'Size is required' }).positive('Must be greater than 0'),
});
export type MonitorFormValues = z.infer<typeof monitorSchema>;

export const dockSchema = z.object({
  brand: z.string().trim().min(1, 'Brand is required').max(100, 'Maximum 100 characters'),
});
export type DockFormValues = z.infer<typeof dockSchema>;

export const keyboardMouseSetSchema = z.object({
  brand: z.string().trim().min(1, 'Brand is required').max(100, 'Maximum 100 characters'),
  connectionType: z.enum([CONNECTION_TYPE.Wired, CONNECTION_TYPE.Bluetooth, CONNECTION_TYPE.WirelessDongle], {
    errorMap: () => ({ message: 'Select a connection type' }),
  }),
});
export type KeyboardMouseSetFormValues = z.infer<typeof keyboardMouseSetSchema>;

export const storageSchema = z
  .object({
    serialNumber: z.string().trim().min(1, 'Serial number is required').max(150, 'Maximum 150 characters'),
    capacity: z.coerce.number({ invalid_type_error: 'Capacity is required' }).int().positive('Must be greater than 0'),
    storageType: z.enum([STORAGE_TYPE.SSD, STORAGE_TYPE.NVMe, STORAGE_TYPE.HDD], {
      errorMap: () => ({ message: 'Select a storage type' }),
    }),
    storageUnit: z.enum([STORAGE_UNIT.GB, STORAGE_UNIT.TB], {
      errorMap: () => ({ message: 'Select a unit' }),
    }),
    laptopId: z.string().optional().nullable(),
    desktopPcId: z.string().optional().nullable(),
  })
  .refine((data) => !(data.laptopId && data.desktopPcId), {
    message: 'Storage can belong to a laptop OR a desktop PC, never both.',
    path: ['desktopPcId'],
  });
export type StorageFormValues = z.infer<typeof storageSchema>;

// Used when creating a new storage device inline from the asset-creation dialog: the parent
// (laptopId/desktopPcId) isn't part of the form since it's attached to the asset being created
// as a separate step, once that asset has an id.
export const inlineStorageSchema = z.object({
  serialNumber: z.string().trim().min(1, 'Serial number is required').max(150, 'Maximum 150 characters'),
  capacity: z.coerce.number({ invalid_type_error: 'Capacity is required' }).int().positive('Must be greater than 0'),
  storageType: z.enum([STORAGE_TYPE.SSD, STORAGE_TYPE.NVMe, STORAGE_TYPE.HDD], {
    errorMap: () => ({ message: 'Select a storage type' }),
  }),
  storageUnit: z.enum([STORAGE_UNIT.GB, STORAGE_UNIT.TB], {
    errorMap: () => ({ message: 'Select a unit' }),
  }),
});
export type InlineStorageFormValues = z.infer<typeof inlineStorageSchema>;

export const assetStatusSchema = z.object({
  status: z.enum([ASSET_STATUS.Available, ASSET_STATUS.Assigned, ASSET_STATUS.InRepair, ASSET_STATUS.Broken], {
    errorMap: () => ({ message: 'Select a status' }),
  }),
});
export type AssetStatusFormValues = z.infer<typeof assetStatusSchema>;
