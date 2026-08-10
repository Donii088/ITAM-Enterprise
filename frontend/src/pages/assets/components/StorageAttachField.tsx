import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HardDrive, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { FormInput } from '@/components/shared/form/FormInput';
import { FormSelect } from '@/components/shared/form/FormSelect';
import { useStorageList, useCreateStorage } from '@/features/assets/useAssets';
import { inlineStorageSchema, type InlineStorageFormValues } from '@/features/assets/schemas';
import { formatStorageCapacity } from '@/lib/formatters';
import { STORAGE_TYPE, STORAGE_UNIT, type StorageDevice } from '@/types';

const STORAGE_TYPE_OPTIONS = Object.values(STORAGE_TYPE).map((v) => ({ value: v, label: v }));
const STORAGE_UNIT_OPTIONS = Object.values(STORAGE_UNIT).map((v) => ({ value: v, label: v }));

function storageLabel(storage: StorageDevice): string {
  return `${storage.serialNumber} — ${storage.storageType}, ${formatStorageCapacity(storage.capacity, storage.storageUnit)}`;
}

export interface StorageAttachFieldProps {
  value: string | null;
  onChange: (storageId: string | null) => void;
}

export function StorageAttachField({ value, onChange }: StorageAttachFieldProps) {
  const { data, isLoading } = useStorageList({ unassignedOnly: true, pageSize: 100 });
  const [createOpen, setCreateOpen] = React.useState(false);
  // Tracks a device created via the inline dialog so it can be shown as a confirmation
  // card instead of routed through the <Select>. Radix's Select keeps a hidden native
  // <select> in sync for form integration, but it only registers an <option> once its
  // <SelectItem> has actually been rendered (i.e. the dropdown was opened) — setting
  // `value` to an id that was never rendered gets silently reset back to empty by that
  // native-select sync. Showing a confirmation card sidesteps the Select entirely for
  // this case, so it never needs a value it hasn't mounted an option for.
  const [justCreated, setJustCreated] = React.useState<StorageDevice | null>(null);

  const options = data?.items ?? [];
  const showConfirmation = Boolean(justCreated && value === justCreated.id);

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <HardDrive className="h-4 w-4 text-muted-foreground" /> Storage device
        <span className="font-normal text-muted-foreground">(optional)</span>
      </div>

      {showConfirmation && justCreated ? (
        <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 p-3">
          <div className="min-w-0 flex-1 text-sm text-foreground">{storageLabel(justCreated)}</div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Remove storage device"
            onClick={() => {
              setJustCreated(null);
              onChange(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <FormField className="flex-1" htmlFor="storage-attach-select">
            <Select
              value={value ?? '__none__'}
              onValueChange={(v) => onChange(v === '__none__' ? null : v)}
              disabled={isLoading}
            >
              <SelectTrigger id="storage-attach-select">
                <SelectValue placeholder={isLoading ? 'Loading storage devices…' : 'Select a storage device'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No storage device</SelectItem>
                {options.map((storage) => (
                  <SelectItem key={storage.id} value={storage.id}>
                    {storageLabel(storage)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setCreateOpen(true)}
          >
            Create new storage
          </Button>
        </div>
      )}

      {!isLoading && !showConfirmation && options.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No unassigned storage devices found. Use "Create new storage" to add one.
        </p>
      )}

      <CreateStorageInlineDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(storage) => {
          setJustCreated(storage);
          onChange(storage.id);
        }}
      />
    </div>
  );
}

function CreateStorageInlineDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (storage: StorageDevice) => void;
}) {
  const createStorage = useCreateStorage();
  const { control, handleSubmit, reset, formState } = useForm<InlineStorageFormValues>({
    resolver: zodResolver(inlineStorageSchema),
    defaultValues: { serialNumber: '', capacity: 0, storageType: STORAGE_TYPE.SSD, storageUnit: STORAGE_UNIT.GB },
  });

  function onSubmit(values: InlineStorageFormValues) {
    createStorage
      .mutateAsync({ ...values, laptopId: null, desktopPcId: null })
      .then((storage) => {
        onCreated(storage);
        reset();
        onOpenChange(false);
      })
      .catch(() => undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Create new storage device</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            // Radix Dialog content is portaled outside this DOM subtree, but React still
            // bubbles synthetic events along the *component* tree — without stopping
            // propagation here, this submit would also fire the outer asset-creation
            // form's onSubmit (since this dialog is nested inside it in JSX), saving the
            // asset before the newly created storage device is attached.
            e.stopPropagation();
            handleSubmit(onSubmit)(e);
          }}
          noValidate
          className="space-y-4"
        >
          <FormInput control={control} name="serialNumber" label="Serial number" required />
          <div className="grid grid-cols-2 gap-4">
            <FormInput control={control} name="capacity" label="Capacity" type="number" min={1} required />
            <FormSelect control={control} name="storageUnit" label="Unit" options={STORAGE_UNIT_OPTIONS} required />
          </div>
          <FormSelect control={control} name="storageType" label="Storage type" options={STORAGE_TYPE_OPTIONS} required />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={formState.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={formState.isSubmitting || createStorage.isPending}>
              Create & select
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
