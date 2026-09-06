import { apiClient, unwrapResponse } from '@/lib/api-client';
import { pruneEmpty } from '@/lib/utils';
import type { CreateUserRequest, GetUsersQuery, PagedResult, UpdateUserRequest, User } from '@/types';

export const userService = {
  getPaged: (query: GetUsersQuery) =>
    unwrapResponse<PagedResult<User>>(apiClient.get('/users', { params: pruneEmpty(query) })),

  getById: (id: string) => unwrapResponse<User>(apiClient.get(`/users/${id}`)),

  create: (payload: CreateUserRequest) => unwrapResponse<User>(apiClient.post('/users', payload)),

  update: (id: string, payload: UpdateUserRequest) =>
    unwrapResponse<User>(apiClient.put(`/users/${id}`, payload)),

  deactivate: (id: string) => unwrapResponse<User>(apiClient.post(`/users/${id}/deactivate`)),

  activate: (id: string) => unwrapResponse<User>(apiClient.post(`/users/${id}/activate`)),

  hardDelete: (id: string) => unwrapResponse<void>(apiClient.delete(`/users/${id}`)),
};
