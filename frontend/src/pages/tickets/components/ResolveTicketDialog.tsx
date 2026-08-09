import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormTextarea } from '@/components/shared/form/FormTextarea';
import { resolveTicketSchema, type ResolveTicketFormValues } from '@/features/tickets/schemas';
import { useResolveTicket } from '@/features/tickets/useTickets';

export interface ResolveTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
}

export function ResolveTicketDialog({ open, onOpenChange, ticketId }: ResolveTicketDialogProps) {
  const resolveTicket = useResolveTicket();
  const { control, handleSubmit, reset, formState } = useForm<ResolveTicketFormValues>({
    resolver: zodResolver(resolveTicketSchema),
    defaultValues: { repairDescription: '' },
  });

  function onSubmit(values: ResolveTicketFormValues) {
    resolveTicket
      .mutateAsync({ id: ticketId, payload: values })
      .then(() => {
        reset();
        onOpenChange(false);
      })
      .catch(() => undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Resolve ticket</DialogTitle>
          <DialogDescription>
            Describe the repair performed. This will mark the ticket as Done and add an entry to the asset's repair
            history.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormTextarea
            control={control}
            name="repairDescription"
            label="Repair description"
            placeholder="Replaced the battery and re-imaged the OS…"
            rows={5}
            required
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={formState.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={formState.isSubmitting || resolveTicket.isPending}>
              Resolve ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
