import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError, ApiResponse, AuthResponse } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

export const AUTH_LOGOUT_EVENT = 'itam:auth-logout';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  try {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const data = response.data.data;
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

function normalizeError(error: AxiosError<ApiResponse>): ApiError {
  const status = error.response?.status ?? 0;

  if (!error.response) {
    return {
      status: 0,
      message: 'Unable to reach the server. Check your connection and try again.',
      errors: [],
    };
  }

  const payload = error.response.data;
  const errors = payload?.errors ?? [];
  let message = payload?.message || 'Something went wrong. Please try again.';

  if (status === 401 && !payload?.message) message = 'Your session has expired. Please log in again.';
  if (status === 403) message = payload?.message || 'You do not have permission to perform this action.';
  if (status === 404) message = payload?.message || 'The requested resource was not found.';
  if (status >= 500) message = payload?.message || 'A server error occurred. Please try again later.';

  return { status, message, errors };
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;

      if (newToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(originalRequest);
      }

      useAuthStore.getState().clearAuth();
      window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
    }

    return Promise.reject(normalizeError(error));
  },
);

export async function unwrapResponse<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'status' in error && 'message' in error;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export type { AxiosRequestConfig };
