import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { FormInput } from '@/components/shared/form/FormInput';
import { FormTextarea } from '@/components/shared/form/FormTextarea';
import { FormSelect } from '@/components/shared/form/FormSelect';
import { FormFileInput } from '@/components/shared/form/FormFileInput';
import { createTicketSchema, type CreateTicketFormValues } from '@/features/tickets/schemas';
import { useCreateTicket } from '@/features/tickets/useTickets';
import { useUploadTicketAttachment } from '@/features/attachments/useAttachments';
import { useMyAssets } from '@/features/assignments/useAssignments';
import { ALLOWED_PHOTO_EXTENSIONS, validatePhotoFile } from '@/lib/file-validation';
import { TICKET_PRIORITY, ASSET_TYPE_LABELS } from '@/types';

const PRIORITY_OPTIONS = Object.values(TICKET_PRIORITY).map((v) => ({ value: v, label: v }));

export function CreateTicketDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createTicket = useCreateTicket();
  const uploadAttachment = useUploadTicketAttachment();
  const { data: myAssets, isLoading: assetsLoading } = useMyAssets();
  const [photo, setPhoto] = React.useState<File | null>(null);

  const { control, handleSubmit, reset, formState } = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { title: '', description: '', priority: TICKET_PRIORITY.Medium, assetId: '' },
  });

  const assetOptions =
    myAssets?.map((a) => ({
      value: a.assetId,
      label: `${a.assetBrand ?? ''} ${a.assetModel ?? a.assetSerial ?? ''} — ${ASSET_TYPE_LABELS[a.assetType]}`.trim(),
    })) ?? [];

  async function onSubmit(values: CreateTicketFormValues) {
    let ticket;
    try {
      ticket = await createTicket.mutateAsync(values);
    } catch {
      return;
    }

    if (photo) {
      // The mutation itself surfaces a toast on success/failure; a failed photo upload
      // shouldn't block closing the dialog since the ticket was already created.
      await uploadAttachment.mutateAsync({ entityId: ticket.id, file: photo }).catch(() => undefined);
    }

    reset();
    setPhoto(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
        </DialogHeader>

        {!assetsLoading && assetOptions.length === 0 ? (
          <Alert variant="warning" title="No assigned assets">
            You don't have any assets assigned to you yet, so a ticket can't be filed. Contact your IT administrator.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormSelect
              control={control}
              name="assetId"
              label="Affected asset"
              options={assetOptions}
              placeholder={assetsLoading ? 'Loading your assets…' : 'Select an asset'}
              disabled={assetsLoading}
              required
            />
            <FormInput control={control} name="title" label="Title" placeholder="Brief summary of the issue" required />
            <FormTextarea
              control={control}
              name="description"
              label="Description"
              placeholder="Describe what's wrong, when it started, and any error messages…"
              rows={5}
              required
            />
            <FormSelect control={control} name="priority" label="Priority" options={PRIORITY_OPTIONS} required />
            <FormFileInput
              label="Photo"
              hint="Optional — attach a photo of the issue"
              file={photo}
              onChange={setPhoto}
              accept={ALLOWED_PHOTO_EXTENSIONS}
              validate={validatePhotoFile}
              browseLabel="Click to upload a photo"
              helpText="JPG, PNG or WEBP — up to 5MB"
              disabled={formState.isSubmitting}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" isLoading={formState.isSubmitting || createTicket.isPending || uploadAttachment.isPending}>
                Submit ticket
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
