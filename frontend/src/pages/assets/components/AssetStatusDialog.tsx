import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormSelect } from '@/components/shared/form/FormSelect';
import { assetStatusSchema, type AssetStatusFormValues } from '@/features/assets/schemas';
import { useUpdateAssetStatus } from '@/features/assets/useAssets';
import { ASSET_STATUS, ASSET_STATUS_LABELS, type AssetStatus } from '@/types';

export interface AssetStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string;
  currentStatus: AssetStatus;
}

const STATUS_OPTIONS = Object.values(ASSET_STATUS).map((v) => ({ value: v, label: ASSET_STATUS_LABELS[v] }));

export function AssetStatusDialog({ open, onOpenChange, assetId, currentStatus }: AssetStatusDialogProps) {
  const updateStatus = useUpdateAssetStatus();
  const { control, handleSubmit, formState } = useForm<AssetStatusFormValues>({
    resolver: zodResolver(assetStatusSchema),
    defaultValues: { status: currentStatus },
  });

  function onSubmit(values: AssetStatusFormValues) {
    updateStatus
      .mutateAsync({ id: assetId, payload: values })
      .then(() => onOpenChange(false))
      .catch(() => undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Update asset status</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormSelect control={control} name="status" label="Status" options={STATUS_OPTIONS} required />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={formState.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={formState.isSubmitting || updateStatus.isPending}>
              Update status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
