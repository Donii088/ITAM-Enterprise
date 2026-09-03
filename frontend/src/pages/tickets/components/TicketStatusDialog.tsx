import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormSelect } from '@/components/shared/form/FormSelect';
import { updateTicketStatusSchema, type UpdateTicketStatusFormValues } from '@/features/tickets/schemas';
import { useUpdateTicketStatus } from '@/features/tickets/useTickets';
import { TICKET_STATUS, TICKET_STATUS_LABELS, type TicketStatus } from '@/types';

// Done and Cancelled are not offered here — Done is only reachable through the resolve flow,
// and Cancelled is owner-only (this dialog is admin-only). See the matching comment in
// features/tickets/schemas.ts.
const STATUS_OPTIONS = Object.values(TICKET_STATUS)
  .filter((v) => v !== TICKET_STATUS.Done && v !== TICKET_STATUS.Cancelled)
  .map((v) => ({ value: v, label: TICKET_STATUS_LABELS[v] }));

export interface TicketStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  currentStatus: TicketStatus;
}

export function TicketStatusDialog({ open, onOpenChange, ticketId, currentStatus }: TicketStatusDialogProps) {
  const updateStatus = useUpdateTicketStatus();
  const { control, handleSubmit, formState } = useForm<UpdateTicketStatusFormValues>({
    resolver: zodResolver(updateTicketStatusSchema),
    // Callers only open this dialog for tickets that aren't already Done, so currentStatus is
    // always one of the selectable options above.
    defaultValues: { status: currentStatus as UpdateTicketStatusFormValues['status'] },
  });

  function onSubmit(values: UpdateTicketStatusFormValues) {
    updateStatus
      .mutateAsync({ id: ticketId, payload: values })
      .then(() => onOpenChange(false))
      .catch(() => undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Update ticket status</DialogTitle>
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
