import { apiClient, unwrapResponse } from '@/lib/api-client';
import { pruneEmpty } from '@/lib/utils';
import type { CreateTicketRequest, GetTicketsQuery, PagedResult, Ticket, UpdateTicketStatusRequest } from '@/types';

export const ticketService = {
  create: (payload: CreateTicketRequest) => unwrapResponse<Ticket>(apiClient.post('/tickets', payload)),

  getMyTickets: (query: GetTicketsQuery) =>
    unwrapResponse<PagedResult<Ticket>>(apiClient.get('/tickets/my-tickets', { params: pruneEmpty(query) })),

  getById: (id: string) => unwrapResponse<Ticket>(apiClient.get(`/tickets/${id}`)),

  cancel: (id: string) => unwrapResponse<Ticket>(apiClient.post(`/tickets/${id}/cancel`)),

  getPaged: (query: GetTicketsQuery) =>
    unwrapResponse<PagedResult<Ticket>>(apiClient.get('/tickets', { params: pruneEmpty(query) })),

  updateStatus: (id: string, payload: UpdateTicketStatusRequest) =>
    unwrapResponse<Ticket>(apiClient.post(`/tickets/${id}/status`, payload)),

  delete: (id: string) => unwrapResponse<void>(apiClient.delete(`/tickets/${id}`)),
};
