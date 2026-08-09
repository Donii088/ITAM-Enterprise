import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormSelect } from '@/components/shared/form/FormSelect';
import { updateTicketStatusSchema, type UpdateTicketStatusFormValues } from '@/features/tickets/schemas';
import { useUpdateTicketStatus } from '@/features/tickets/useTickets';
import { TICKET_STATUS, TICKET_STATUS_LABELS, type TicketStatus } from '@/types';

const STATUS_OPTIONS = Object.values(TICKET_STATUS).map((v) => ({ value: v, label: TICKET_STATUS_LABELS[v] }));

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
    defaultValues: { status: currentStatus },
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
