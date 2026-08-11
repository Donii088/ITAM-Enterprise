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
import { useStorageList, useCreateStorage, useAttachStorageToAsset } from '@/features/assets/useAssets';
import { inlineStorageSchema, type InlineStorageFormValues } from '@/features/assets/schemas';
import { formatStorageCapacity } from '@/lib/formatters';
import { STORAGE_TYPE, STORAGE_UNIT, type StorageDevice } from '@/types';

const STORAGE_TYPE_OPTIONS = Object.values(STORAGE_TYPE).map((v) => ({ value: v, label: v }));
const STORAGE_UNIT_OPTIONS = Object.values(STORAGE_UNIT).map((v) => ({ value: v, label: v }));

function storageLabel(storage: StorageDevice): string {
  return `${storage.serialNumber} — ${storage.storageType}, ${formatStorageCapacity(storage.capacity, storage.storageUnit)}`;
}

export interface StorageManagerFieldProps {
  /** 'create': changes are staged locally and attached once the asset exists. 'edit': changes apply immediately. */
  mode: 'create' | 'edit';
  parentType: 'laptop' | 'desktop';
  /** The asset's id — required in edit mode, unused in create mode. */
  assetId?: string;
  /** Devices already attached to this asset (create: staged locally; edit: from the asset's current data). */
  attached: StorageDevice[];
  /** Create mode only: called when the staged list changes. */
  onAttachedChange?: (items: StorageDevice[]) => void;
  disabled?: boolean;
}

export function StorageManagerField({
  mode,
  parentType,
  assetId,
  attached,
  onAttachedChange,
  disabled,
}: StorageManagerFieldProps) {
  const { data, isLoading } = useStorageList({ unassignedOnly: true, pageSize: 100 });
  const [createOpen, setCreateOpen] = React.useState(false);
  const attachStorage = useAttachStorageToAsset();
  const [detachingId, setDetachingId] = React.useState<string | null>(null);

  const attachedIds = new Set(attached.map((s) => s.id));
  const options = (data?.items ?? []).filter((s) => !attachedIds.has(s.id));

  function addDevice(storage: StorageDevice) {
    if (mode === 'edit' && assetId) {
      attachStorage.mutate(
        {
          storageId: storage.id,
          laptopId: parentType === 'laptop' ? assetId : null,
          desktopPcId: parentType === 'desktop' ? assetId : null,
        },
        { onSuccess: () => onAttachedChange?.([...attached, storage]) },
      );
    } else {
      onAttachedChange?.([...attached, storage]);
    }
  }

  function removeDevice(storage: StorageDevice) {
    if (mode === 'edit') {
      setDetachingId(storage.id);
      attachStorage.mutate(
        { storageId: storage.id },
        {
          onSuccess: () => onAttachedChange?.(attached.filter((s) => s.id !== storage.id)),
          onSettled: () => setDetachingId(null),
        },
      );
    } else {
      onAttachedChange?.(attached.filter((s) => s.id !== storage.id));
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <HardDrive className="h-4 w-4 text-muted-foreground" /> Storage devices
        <span className="font-normal text-muted-foreground">(optional, multiple allowed)</span>
      </div>

      {attached.length > 0 && (
        <ul className="space-y-2">
          {attached.map((storage) => (
            <li
              key={storage.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2"
            >
              <span className="text-sm text-foreground">{storageLabel(storage)}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => removeDevice(storage)}
                disabled={disabled || (mode === 'edit' && detachingId === storage.id)}
                aria-label={`Remove ${storage.serialNumber}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <FormField className="flex-1" htmlFor="storage-manager-select">
          {/* The controlled value stays permanently empty so the trigger always shows the
              placeholder — this is a one-shot "add" action, not a persistent selection,
              which sidesteps a Radix Select quirk where a controlled value that was never
              rendered as an option gets silently reset back to empty. */}
          <Select
            value=""
            onValueChange={(v) => {
              const storage = options.find((s) => s.id === v);
              if (storage) addDevice(storage);
            }}
            disabled={isLoading || disabled}
          >
            <SelectTrigger id="storage-manager-select">
              <SelectValue placeholder={isLoading ? 'Loading storage devices…' : 'Add an existing storage device'} />
            </SelectTrigger>
            <SelectContent>
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
          disabled={disabled}
        >
          Create new storage
        </Button>
      </div>

      {!isLoading && options.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No unassigned storage devices found. Use "Create new storage" to add one.
        </p>
      )}

      <CreateStorageInlineDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={addDevice} />
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
            // See the comment in StorageAttachField's predecessor: this dialog can be opened
            // from inside the outer asset form, and React re-dispatches events along the
            // component tree even though Radix portals this content elsewhere in the DOM.
            // Without stopping propagation, submitting this inner form would also submit
            // the outer asset form.
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
              Create & add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
