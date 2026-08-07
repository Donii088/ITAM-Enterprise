import type {
  GetAssetsQuery,
  GetAssignmentsQuery,
  GetRepairsQuery,
  GetStorageQuery,
  GetTicketsQuery,
  GetUsersQuery,
} from '@/types';

export const queryKeys = {
  assets: {
    all: ['assets'] as const,
    list: (params: GetAssetsQuery) => ['assets', 'list', params] as const,
    detail: (id: string) => ['assets', 'detail', id] as const,
    storageList: (params: GetStorageQuery) => ['assets', 'storage', 'list', params] as const,
    storageDetail: (id: string) => ['assets', 'storage', 'detail', id] as const,
  },
  assignments: {
    all: ['assignments'] as const,
    list: (params: GetAssignmentsQuery) => ['assignments', 'list', params] as const,
    myAssets: ['assignments', 'my-assets'] as const,
    assetHistory: (assetId: string) => ['assignments', 'history', assetId] as const,
  },
  attachments: {
    byTicket: (ticketId: string) => ['attachments', 'ticket', ticketId] as const,
    byRepair: (repairId: string) => ['attachments', 'repair', repairId] as const,
    byAsset: (assetId: string) => ['attachments', 'asset', assetId] as const,
  },
  dashboard: {
    overview: ['dashboard', 'overview'] as const,
    my: ['dashboard', 'my'] as const,
  },
  repairs: {
    all: ['repairs'] as const,
    list: (params: GetRepairsQuery) => ['repairs', 'list', params] as const,
    byTicket: (ticketId: string) => ['repairs', 'ticket', ticketId] as const,
    byAsset: (assetId: string) => ['repairs', 'asset', assetId] as const,
  },
  search: {
    query: (term: string, limit: number) => ['search', term, limit] as const,
  },
  tickets: {
    all: ['tickets'] as const,
    list: (params: GetTicketsQuery) => ['tickets', 'list', params] as const,
    myTickets: (params: GetTicketsQuery) => ['tickets', 'my-tickets', params] as const,
    detail: (id: string) => ['tickets', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params: GetUsersQuery) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
};
