import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormTextarea } from '@/components/shared/form/FormTextarea';
import { MultiFileInput } from '@/components/shared/form/MultiFileInput';
import { resolveTicketSchema, type ResolveTicketFormValues } from '@/features/tickets/schemas';
import { useResolveTicket } from '@/features/tickets/useTickets';
import { useUploadRepairAttachment } from '@/features/attachments/useAttachments';
import { ALLOWED_PHOTO_EXTENSIONS, validatePhotoFile } from '@/lib/file-validation';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

const MAX_PHOTOS = 5;

export interface ResolveTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
}

export function ResolveTicketDialog({ open, onOpenChange, ticketId }: ResolveTicketDialogProps) {
  const queryClient = useQueryClient();
  const resolveTicket = useResolveTicket();
  const uploadAttachment = useUploadRepairAttachment();
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);

  const { control, handleSubmit, reset, formState } = useForm<ResolveTicketFormValues>({
    resolver: zodResolver(resolveTicketSchema),
    defaultValues: { repairDescription: '' },
  });

  async function onSubmit(values: ResolveTicketFormValues) {
    let result;
    try {
      result = await resolveTicket.mutateAsync({ id: ticketId, payload: values });
    } catch {
      // Keep the form (including selected photos) intact so the user can retry.
      return;
    }

    if (photos.length > 0) {
      setUploading(true);
      const results = await Promise.allSettled(
        photos.map((file) => uploadAttachment.mutateAsync({ entityId: result.repair.id, file })),
      );
      setUploading(false);

      // Resolution photos are surfaced in the ticket's own attachment gallery (merged
      // server-side via RepairHistory -> Ticket), but the upload mutation only invalidates the
      // repair-scoped query — refresh the ticket-scoped one too so it shows up without a reload.
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.byTicket(ticketId) });

      const failedCount = results.filter((r) => r.status === 'rejected').length;
      if (failedCount > 0) {
        toast.error(
          `Ticket resolved, but ${failedCount} of ${photos.length} photo${photos.length === 1 ? '' : 's'} failed to upload. You can add them from the ticket page.`,
        );
      }
    }

    reset();
    setPhotos([]);
    onOpenChange(false);
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
          <MultiFileInput
            label="Resolution photos"
            hint={`Optional — attach up to ${MAX_PHOTOS} photos of the completed repair`}
            files={photos}
            onChange={setPhotos}
            accept={ALLOWED_PHOTO_EXTENSIONS}
            validate={validatePhotoFile}
            browseLabel="Click to upload photos"
            helpText="JPG, PNG or WEBP — up to 5MB each"
            disabled={formState.isSubmitting || uploading}
            maxFiles={MAX_PHOTOS}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={formState.isSubmitting || uploading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={formState.isSubmitting || resolveTicket.isPending || uploading}>
              Resolve ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
