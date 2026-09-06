import { z } from 'zod';
import { TICKET_PRIORITY, TICKET_STATUS } from '@/types';

export const createTicketSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Maximum 200 characters'),
  description: z.string().trim().min(1, 'Description is required').max(4000, 'Maximum 4000 characters'),
  priority: z.enum([TICKET_PRIORITY.Low, TICKET_PRIORITY.Medium, TICKET_PRIORITY.High, TICKET_PRIORITY.Critical], {
    errorMap: () => ({ message: 'Select a priority' }),
  }),
  assetId: z.string().min(1, 'Select the affected asset'),
});
export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

// Done is intentionally excluded — a ticket can only reach Done through the resolve flow
// (POST /tickets/{id}/resolve), which also records the repair history. The backend rejects a
// manual status change to Done for the same reason (see TicketService.UpdateStatusAsync).
// Cancelled is also excluded — this dialog is admin-only, but cancelling is reserved for the
// ticket's own owner with no admin override (see TicketService.UpdateStatusAsync/CancelAsync),
// so offering it here would always fail. Owners cancel via the separate Cancel action instead.
export const updateTicketStatusSchema = z.object({
  status: z.enum(
    [TICKET_STATUS.Open, TICKET_STATUS.OnReview, TICKET_STATUS.InProgress],
    { errorMap: () => ({ message: 'Select a status' }) },
  ),
});
export type UpdateTicketStatusFormValues = z.infer<typeof updateTicketStatusSchema>;

export const resolveTicketSchema = z.object({
  repairDescription: z.string().trim().min(1, 'Repair description is required').max(4000, 'Maximum 4000 characters'),
});
export type ResolveTicketFormValues = z.infer<typeof resolveTicketSchema>;
