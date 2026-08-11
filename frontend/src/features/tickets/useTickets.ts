import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ticketService } from '@/services/ticketService';
import { repairService } from '@/services/repairService';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api-client';
import type { CreateTicketRequest, GetTicketsQuery, ResolveTicketRequest, UpdateTicketStatusRequest } from '@/types';

export function useTicketsList(query: GetTicketsQuery) {
  return useQuery({
    queryKey: queryKeys.tickets.list(query),
    queryFn: () => ticketService.getPaged(query),
    placeholderData: keepPreviousData,
  });
}

export function useMyTickets(query: GetTicketsQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.tickets.myTickets(query),
    queryFn: () => ticketService.getMyTickets(query),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id ?? ''),
    queryFn: () => ticketService.getById(id as string),
    enabled: Boolean(id),
  });
}

function invalidateTicketRelated(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.my });
  if (id) queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(id) });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketRequest) => ticketService.create(payload),
    onSuccess: () => {
      invalidateTicketRelated(queryClient);
      toast.success('Ticket submitted successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not submit the ticket.')),
  });
}

export function useCancelTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketService.cancel(id),
    onSuccess: (_, id) => {
      invalidateTicketRelated(queryClient, id);
      toast.success('Ticket cancelled.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not cancel the ticket.')),
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTicketStatusRequest }) =>
      ticketService.updateStatus(id, payload),
    onSuccess: (_, variables) => {
      invalidateTicketRelated(queryClient, variables.id);
      toast.success('Ticket status updated.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not update ticket status.')),
  });
}

export function useResolveTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveTicketRequest }) =>
      repairService.resolveTicket(id, payload),
    onSuccess: (_, variables) => {
      invalidateTicketRelated(queryClient, variables.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
      toast.success('Ticket resolved and repair recorded.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not resolve the ticket.')),
  });
}
