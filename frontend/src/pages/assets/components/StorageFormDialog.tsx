import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/shared/form/FormInput';
import { FormSelect } from '@/components/shared/form/FormSelect';
import { storageSchema, type StorageFormValues } from '@/features/assets/schemas';
import { useCreateStorage, useUpdateStorage, useAssetsList } from '@/features/assets/useAssets';
import { ASSET_TYPE, STORAGE_TYPE, STORAGE_UNIT, type StorageDevice } from '@/types';

export interface StorageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storage?: StorageDevice;
}

const STORAGE_TYPE_OPTIONS = Object.values(STORAGE_TYPE).map((v) => ({ value: v, label: v }));
const STORAGE_UNIT_OPTIONS = Object.values(STORAGE_UNIT).map((v) => ({ value: v, label: v }));
const NONE_VALUE = '__none__';

export function StorageFormDialog({ open, onOpenChange, storage }: StorageFormDialogProps) {
  const mode = storage ? 'edit' : 'create';
  const createMutation = useCreateStorage();
  const updateMutation = useUpdateStorage();

  const { data: laptops } = useAssetsList({ assetType: ASSET_TYPE.Laptop, pageSize: 100 });
  const { data: desktops } = useAssetsList({ assetType: ASSET_TYPE.DesktopPc, pageSize: 100 });

  const laptopOptions = [
    { value: NONE_VALUE, label: 'None' },
    ...(laptops?.items.map((l) => ({ value: l.id, label: `${l.brand ?? ''} ${l.model ?? l.serialNumber ?? ''}`.trim() })) ?? []),
  ];
  const desktopOptions = [
    { value: NONE_VALUE, label: 'None' },
    ...(desktops?.items.map((d) => ({ value: d.id, label: `${d.brand ?? ''} ${d.model ?? d.serialNumber ?? ''}`.trim() })) ?? []),
  ];

  const { control, handleSubmit, formState, watch } = useForm<StorageFormValues>({
    resolver: zodResolver(storageSchema),
    defaultValues: {
      serialNumber: storage?.serialNumber ?? '',
      capacity: storage?.capacity ?? 0,
      storageType: storage?.storageType ?? STORAGE_TYPE.SSD,
      storageUnit: storage?.storageUnit ?? STORAGE_UNIT.GB,
      laptopId: storage?.laptopId ?? NONE_VALUE,
      desktopPcId: storage?.desktopPcId ?? NONE_VALUE,
    },
  });

  const laptopId = watch('laptopId');
  const desktopPcId = watch('desktopPcId');

  function onSubmit(values: StorageFormValues) {
    const payload = {
      ...values,
      laptopId: values.laptopId === NONE_VALUE ? null : values.laptopId,
      desktopPcId: values.desktopPcId === NONE_VALUE ? null : values.desktopPcId,
    };
    const mutation =
      mode === 'create'
        ? createMutation.mutateAsync(payload)
        : updateMutation.mutateAsync({ id: storage!.id, payload });
    mutation.then(() => onOpenChange(false)).catch(() => undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add storage device' : 'Edit storage device'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput control={control} name="serialNumber" label="Serial number" required className="sm:col-span-2" />
            <FormInput control={control} name="capacity" label="Capacity" type="number" min={1} required />
            <FormSelect control={control} name="storageUnit" label="Unit" options={STORAGE_UNIT_OPTIONS} required />
            <FormSelect control={control} name="storageType" label="Storage type" options={STORAGE_TYPE_OPTIONS} required className="sm:col-span-2" />
            <FormSelect
              control={control}
              name="laptopId"
              label="Attach to laptop"
              options={laptopOptions}
              disabled={Boolean(desktopPcId && desktopPcId !== NONE_VALUE)}
              hint="A device can be a spare part (None) or attached to exactly one laptop or desktop."
            />
            <FormSelect
              control={control}
              name="desktopPcId"
              label="Attach to desktop PC"
              options={desktopOptions}
              disabled={Boolean(laptopId && laptopId !== NONE_VALUE)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={formState.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>
              {mode === 'create' ? 'Create device' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
