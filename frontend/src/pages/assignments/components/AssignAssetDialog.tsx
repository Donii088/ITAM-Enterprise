import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FormSelect } from '@/components/shared/form/FormSelect';
import { useAssignAsset } from '@/features/assignments/useAssignments';
import { useAssetsList } from '@/features/assets/useAssets';
import { useUsersList } from '@/features/users/useUsers';
import { ASSET_STATUS, ASSET_TYPE_LABELS } from '@/types';

const assignSchema = z.object({
  assetId: z.string().min(1, 'Select an asset'),
  employeeId: z.string().min(1, 'Select an employee'),
});
type AssignFormValues = z.infer<typeof assignSchema>;

export interface AssignAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fills the asset search box, e.g. with a returned asset's serial when re-assigning it. */
  initialAssetSearchTerm?: string;
  /** Pre-selects an employee, e.g. the previous holder when re-assigning from history. */
  initialEmployeeId?: string;
}

export function AssignAssetDialog({ open, onOpenChange, initialAssetSearchTerm, initialEmployeeId }: AssignAssetDialogProps) {
  const assignAsset = useAssignAsset();
  const [assetSearchTerm, setAssetSearchTerm] = React.useState(initialAssetSearchTerm ?? '');
  // Matches by brand, model, and — importantly — serial number (server-side, so it also covers
  // assets not among the first page of results), since assets commonly share the same
  // brand/model and serial is often the only way to tell them apart when assigning.
  const { data: availableAssets, isLoading: assetsLoading } = useAssetsList({
    status: ASSET_STATUS.Available,
    pageSize: 100,
    searchTerm: assetSearchTerm || undefined,
  });
  const { data: employees, isLoading: employeesLoading } = useUsersList({ pageSize: 100, includeInactive: false });

  const { control, handleSubmit, reset, formState } = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: { assetId: '', employeeId: initialEmployeeId ?? '' },
  });

  // Re-seed on every open so re-opening the dialog for a different "Re-assign" row (while it
  // stays mounted) doesn't carry over the previous row's prefilled search term or employee.
  React.useEffect(() => {
    if (open) {
      setAssetSearchTerm(initialAssetSearchTerm ?? '');
      reset({ assetId: '', employeeId: initialEmployeeId ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialAssetSearchTerm, initialEmployeeId]);

  const assetOptions =
    availableAssets?.items.map((a) => ({
      value: a.id,
      label: `${a.brand ?? ''} ${a.model ?? a.serialNumber ?? ''} — ${ASSET_TYPE_LABELS[a.assetType]}`.trim(),
    })) ?? [];

  const employeeOptions = employees?.items.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.email})` })) ?? [];

  function onSubmit(values: AssignFormValues) {
    assignAsset.mutateAsync(values).then(() => {
      reset({ assetId: '', employeeId: '' });
      setAssetSearchTerm('');
      onOpenChange(false);
    }).catch(() => undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Assign asset</DialogTitle>
          <DialogDescription>Give an available asset to an employee.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <SearchInput
            value={assetSearchTerm}
            onChange={setAssetSearchTerm}
            placeholder="Search by brand, model, or serial number…"
          />
          <FormSelect
            control={control}
            name="assetId"
            label="Asset"
            options={assetOptions}
            placeholder={assetsLoading ? 'Loading assets…' : 'Select an available asset'}
            disabled={assetsLoading}
            required
            hint={
              !assetsLoading && assetOptions.length === 0
                ? assetSearchTerm
                  ? 'No available assets match your search.'
                  : 'No available assets to assign.'
                : undefined
            }
          />
          <FormSelect
            control={control}
            name="employeeId"
            label="Employee"
            options={employeeOptions}
            placeholder={employeesLoading ? 'Loading employees…' : 'Select an employee'}
            disabled={employeesLoading}
            required
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={formState.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={formState.isSubmitting || assignAsset.isPending}>
              Assign asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
