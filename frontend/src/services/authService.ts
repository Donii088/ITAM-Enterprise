import { apiClient, unwrapResponse } from '@/lib/api-client';
import type { AuthResponse, LoginRequest, LogoutRequest, RefreshTokenRequest } from '@/types';

export const authService = {
  login: (payload: LoginRequest) => unwrapResponse<AuthResponse>(apiClient.post('/auth/login', payload)),

  refresh: (payload: RefreshTokenRequest) =>
    unwrapResponse<AuthResponse>(apiClient.post('/auth/refresh', payload)),

  logout: (payload: LogoutRequest) => unwrapResponse<void>(apiClient.post('/auth/logout', payload)),
};
