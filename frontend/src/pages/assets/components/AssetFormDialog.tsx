import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { FormInput } from '@/components/shared/form/FormInput';
import { FormSelect } from '@/components/shared/form/FormSelect';
import { StorageManagerField } from './StorageManagerField';
import {
  desktopPcSchema,
  dockSchema,
  headsetSchema,
  keyboardMouseSetSchema,
  laptopSchema,
  monitorSchema,
  type DesktopPcFormValues,
  type DockFormValues,
  type HeadsetFormValues,
  type KeyboardMouseSetFormValues,
  type LaptopFormValues,
  type MonitorFormValues,
} from '@/features/assets/schemas';
import { useAttachStorageToAsset, useCreateAsset, useUpdateAsset } from '@/features/assets/useAssets';
import {
  ASSET_TYPE,
  ASSET_TYPE_LABELS,
  CONNECTION_TYPE,
  CONNECTION_TYPE_LABELS,
  type AssetDetails,
  type AssetType,
  type StorageDevice,
} from '@/types';

export interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixedType?: AssetType;
  asset?: AssetDetails;
}

const ASSET_TYPE_OPTIONS = Object.values(ASSET_TYPE).map((value) => ({ value, label: ASSET_TYPE_LABELS[value] }));
const CONNECTION_TYPE_OPTIONS = Object.entries(CONNECTION_TYPE_LABELS).map(([value, label]) => ({ value, label }));
// Headsets only support Wired/Bluetooth, unlike KeyboardMouseSet which also allows WirelessDongle.
const HEADSET_CONNECTION_TYPE_OPTIONS = [
  { value: CONNECTION_TYPE.Wired, label: CONNECTION_TYPE_LABELS.Wired },
  { value: CONNECTION_TYPE.Bluetooth, label: CONNECTION_TYPE_LABELS.Bluetooth },
];

function LaptopOrDesktopFields({ control }: { control: ReturnType<typeof useForm<LaptopFormValues>>['control'] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormInput control={control} name="brand" label="Brand" placeholder="Dell, HP, Lenovo…" required />
      <FormInput control={control} name="model" label="Model" placeholder="Latitude 5540" required />
      <FormInput control={control} name="serialNumber" label="Serial number" placeholder="SN-0001" required className="sm:col-span-2" />
      <FormInput control={control} name="cpu" label="CPU" placeholder="Intel Core i7-1355U" required />
      <FormInput control={control} name="gpu" label="GPU" placeholder="Intel Iris Xe" required />
      <FormInput control={control} name="ram" label="RAM (GB)" type="number" min={1} placeholder="16" required />
    </div>
  );
}

function LaptopForm({ mode, asset, onDone }: { mode: 'create' | 'edit'; asset?: AssetDetails; onDone: () => void }) {
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const attachStorage = useAttachStorageToAsset();
  const [attached, setAttached] = React.useState<StorageDevice[]>(asset?.storageDevices ?? []);
  const { control, handleSubmit, formState } = useForm<LaptopFormValues>({
    resolver: zodResolver(laptopSchema),
    defaultValues: {
      serialNumber: asset?.serialNumber ?? '',
      brand: asset?.brand ?? '',
      model: asset?.model ?? '',
      cpu: asset?.cpu ?? '',
      gpu: asset?.gpu ?? '',
      ram: asset?.ram ?? 0,
    },
  });

  function onSubmit(values: LaptopFormValues) {
    const mutation =
      mode === 'create'
        ? createMutation.mutateAsync({ assetType: ASSET_TYPE.Laptop, payload: values })
        : updateMutation.mutateAsync({ assetType: ASSET_TYPE.Laptop, id: asset!.id, payload: values });

    mutation
      .then(async (created) => {
        if (mode === 'create' && attached.length > 0) {
          const results = await Promise.allSettled(
            attached.map((s) => attachStorage.mutateAsync({ storageId: s.id, laptopId: created.id })),
          );
          const failedCount = results.filter((r) => r.status === 'rejected').length;
          if (failedCount > 0) {
            toast.error(
              `Laptop created, but ${failedCount} storage device${failedCount === 1 ? '' : 's'} could not be attached. Attach ${failedCount === 1 ? 'it' : 'them'} from the Storage tab.`,
            );
          }
        }
        onDone();
      })
      .catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <LaptopOrDesktopFields control={control} />
      <StorageManagerField
        mode={mode}
        parentType="laptop"
        assetId={asset?.id}
        attached={attached}
        onAttachedChange={setAttached}
        disabled={formState.isSubmitting}
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={formState.isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={formState.isSubmitting || createMutation.isPending || updateMutation.isPending}
        >
          {mode === 'create' ? 'Create laptop' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DesktopPcForm({ mode, asset, onDone }: { mode: 'create' | 'edit'; asset?: AssetDetails; onDone: () => void }) {
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const attachStorage = useAttachStorageToAsset();
  const [attached, setAttached] = React.useState<StorageDevice[]>(asset?.storageDevices ?? []);
  const { control, handleSubmit, formState } = useForm<DesktopPcFormValues>({
    resolver: zodResolver(desktopPcSchema),
    defaultValues: {
      serialNumber: asset?.serialNumber ?? '',
      brand: asset?.brand ?? '',
      model: asset?.model ?? '',
      cpu: asset?.cpu ?? '',
      gpu: asset?.gpu ?? '',
      ram: asset?.ram ?? 0,
    },
  });

  function onSubmit(values: DesktopPcFormValues) {
    const mutation =
      mode === 'create'
        ? createMutation.mutateAsync({ assetType: ASSET_TYPE.DesktopPc, payload: values })
        : updateMutation.mutateAsync({ assetType: ASSET_TYPE.DesktopPc, id: asset!.id, payload: values });

    mutation
      .then(async (created) => {
        if (mode === 'create' && attached.length > 0) {
          const results = await Promise.allSettled(
            attached.map((s) => attachStorage.mutateAsync({ storageId: s.id, desktopPcId: created.id })),
          );
          const failedCount = results.filter((r) => r.status === 'rejected').length;
          if (failedCount > 0) {
            toast.error(
              `Desktop PC created, but ${failedCount} storage device${failedCount === 1 ? '' : 's'} could not be attached. Attach ${failedCount === 1 ? 'it' : 'them'} from the Storage tab.`,
            );
          }
        }
        onDone();
      })
      .catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <LaptopOrDesktopFields control={control} />
      <StorageManagerField
        mode={mode}
        parentType="desktop"
        assetId={asset?.id}
        attached={attached}
        onAttachedChange={setAttached}
        disabled={formState.isSubmitting}
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={formState.isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={formState.isSubmitting || createMutation.isPending || updateMutation.isPending}
        >
          {mode === 'create' ? 'Create desktop PC' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function MonitorForm({ mode, asset, onDone }: { mode: 'create' | 'edit'; asset?: AssetDetails; onDone: () => void }) {
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const { control, handleSubmit, formState } = useForm<MonitorFormValues>({
    resolver: zodResolver(monitorSchema),
    defaultValues: {
      serialNumber: asset?.serialNumber ?? '',
      brand: asset?.brand ?? '',
      resolution: asset?.resolution ?? '',
      refreshRate: asset?.refreshRate ?? 0,
      size: asset?.size ?? 0,
    },
  });

  function onSubmit(values: MonitorFormValues) {
    const mutation =
      mode === 'create'
        ? createMutation.mutateAsync({ assetType: ASSET_TYPE.Monitor, payload: values })
        : updateMutation.mutateAsync({ assetType: ASSET_TYPE.Monitor, id: asset!.id, payload: values });
    mutation.then(onDone).catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput control={control} name="brand" label="Brand" placeholder="Dell, LG, Samsung…" required />
        <FormInput control={control} name="resolution" label="Resolution" placeholder="2560x1440" required />
        <FormInput control={control} name="refreshRate" label="Refresh rate (Hz)" type="number" min={1} placeholder="144" required />
        <FormInput control={control} name="size" label="Size (inches)" type="number" step="0.1" min={0.1} placeholder="27" required />
        <FormInput
          control={control}
          name="serialNumber"
          label="Serial number"
          placeholder="Optional"
          hint="Optional"
          className="sm:col-span-2"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={formState.isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>
          {mode === 'create' ? 'Create monitor' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DockForm({ mode, asset, onDone }: { mode: 'create' | 'edit'; asset?: AssetDetails; onDone: () => void }) {
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const { control, handleSubmit, formState } = useForm<DockFormValues>({
    resolver: zodResolver(dockSchema),
    defaultValues: { serialNumber: asset?.serialNumber ?? '', brand: asset?.brand ?? '' },
  });

  function onSubmit(values: DockFormValues) {
    const mutation =
      mode === 'create'
        ? createMutation.mutateAsync({ assetType: ASSET_TYPE.Dock, payload: values })
        : updateMutation.mutateAsync({ assetType: ASSET_TYPE.Dock, id: asset!.id, payload: values });
    mutation.then(onDone).catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormInput control={control} name="brand" label="Brand" placeholder="Dell, CalDigit…" required />
      <FormInput control={control} name="serialNumber" label="Serial number" placeholder="Optional" hint="Optional" />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={formState.isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>
          {mode === 'create' ? 'Create dock' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function KeyboardMouseSetForm({
  mode,
  asset,
  onDone,
}: {
  mode: 'create' | 'edit';
  asset?: AssetDetails;
  onDone: () => void;
}) {
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const { control, handleSubmit, formState } = useForm<KeyboardMouseSetFormValues>({
    resolver: zodResolver(keyboardMouseSetSchema),
    defaultValues: {
      serialNumber: asset?.serialNumber ?? '',
      brand: asset?.brand ?? '',
      connectionType: asset?.connectionType ?? undefined,
    },
  });

  function onSubmit(values: KeyboardMouseSetFormValues) {
    const mutation =
      mode === 'create'
        ? createMutation.mutateAsync({ assetType: ASSET_TYPE.KeyboardMouseSet, payload: values })
        : updateMutation.mutateAsync({ assetType: ASSET_TYPE.KeyboardMouseSet, id: asset!.id, payload: values });
    mutation.then(onDone).catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormInput control={control} name="brand" label="Brand" placeholder="Logitech, Microsoft…" required />
      <FormSelect control={control} name="connectionType" label="Connection type" options={CONNECTION_TYPE_OPTIONS} required />
      <FormInput control={control} name="serialNumber" label="Serial number" placeholder="Optional" hint="Optional" />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={formState.isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>
          {mode === 'create' ? 'Create set' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function HeadsetForm({ mode, asset, onDone }: { mode: 'create' | 'edit'; asset?: AssetDetails; onDone: () => void }) {
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const { control, handleSubmit, formState } = useForm<HeadsetFormValues>({
    resolver: zodResolver(headsetSchema),
    defaultValues: {
      serialNumber: asset?.serialNumber ?? '',
      brand: asset?.brand ?? '',
      // Headset assets are always Wired/Bluetooth (enforced by backend validation), so this
      // narrowing from the shared ConnectionType enum is safe.
      connectionType: (asset?.connectionType as HeadsetFormValues['connectionType']) ?? undefined,
    },
  });

  function onSubmit(values: HeadsetFormValues) {
    const mutation =
      mode === 'create'
        ? createMutation.mutateAsync({ assetType: ASSET_TYPE.Headset, payload: values })
        : updateMutation.mutateAsync({ assetType: ASSET_TYPE.Headset, id: asset!.id, payload: values });
    mutation.then(onDone).catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormInput control={control} name="brand" label="Brand" placeholder="Jabra, Logitech…" required />
      <FormSelect
        control={control}
        name="connectionType"
        label="Connection type"
        options={HEADSET_CONNECTION_TYPE_OPTIONS}
        required
      />
      <FormInput control={control} name="serialNumber" label="Serial number" placeholder="Optional" hint="Optional" />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={formState.isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>
          {mode === 'create' ? 'Create headset' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AssetFormDialog({ open, onOpenChange, fixedType, asset }: AssetFormDialogProps) {
  const mode: 'create' | 'edit' = asset ? 'edit' : 'create';
  const [selectedType, setSelectedType] = React.useState<AssetType>(asset?.assetType ?? fixedType ?? ASSET_TYPE.Laptop);

  React.useEffect(() => {
    if (open) setSelectedType(asset?.assetType ?? fixedType ?? ASSET_TYPE.Laptop);
  }, [open, asset, fixedType]);

  function handleDone() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add new asset' : `Edit ${ASSET_TYPE_LABELS[selectedType]}`}</DialogTitle>
        </DialogHeader>

        {mode === 'create' && (
          <FormField label="Asset type" required htmlFor="asset-type-select">
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as AssetType)}>
              <SelectTrigger id="asset-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}

        {selectedType === ASSET_TYPE.Laptop && <LaptopForm mode={mode} asset={asset} onDone={handleDone} />}
        {selectedType === ASSET_TYPE.DesktopPc && <DesktopPcForm mode={mode} asset={asset} onDone={handleDone} />}
        {selectedType === ASSET_TYPE.Monitor && <MonitorForm mode={mode} asset={asset} onDone={handleDone} />}
        {selectedType === ASSET_TYPE.Dock && <DockForm mode={mode} asset={asset} onDone={handleDone} />}
        {selectedType === ASSET_TYPE.KeyboardMouseSet && (
          <KeyboardMouseSetForm mode={mode} asset={asset} onDone={handleDone} />
        )}
        {selectedType === ASSET_TYPE.Headset && <HeadsetForm mode={mode} asset={asset} onDone={handleDone} />}
      </DialogContent>
    </Dialog>
  );
}
