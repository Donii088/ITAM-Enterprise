import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
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

export function AssignAssetDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const assignAsset = useAssignAsset();
  const { data: availableAssets, isLoading: assetsLoading } = useAssetsList({ status: ASSET_STATUS.Available, pageSize: 100 });
  const { data: employees, isLoading: employeesLoading } = useUsersList({ pageSize: 100, includeInactive: false });

  const { control, handleSubmit, reset, formState } = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: { assetId: '', employeeId: '' },
  });

  const assetOptions =
    availableAssets?.items.map((a) => ({
      value: a.id,
      label: `${a.brand ?? ''} ${a.model ?? a.serialNumber ?? ''} — ${ASSET_TYPE_LABELS[a.assetType]}`.trim(),
    })) ?? [];

  const employeeOptions = employees?.items.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.email})` })) ?? [];

  function onSubmit(values: AssignFormValues) {
    assignAsset.mutateAsync(values).then(() => {
      reset();
      onOpenChange(false);
    }).catch(() => undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Assign asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormSelect
            control={control}
            name="assetId"
            label="Asset"
            options={assetOptions}
            placeholder={assetsLoading ? 'Loading assets…' : 'Select an available asset'}
            disabled={assetsLoading}
            required
            hint={!assetsLoading && assetOptions.length === 0 ? 'No available assets to assign.' : undefined}
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
