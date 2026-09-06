import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/lib/api-client';
import { routes } from '@/routes/routes';
import type { ChangePasswordRequest, LoginRequest } from '@/types';

export function useAuth() {
  const { user, accessToken, isHydrated, clearAuth, setAuth } = useAuthStore();
  return {
    user,
    isAuthenticated: Boolean(accessToken && user),
    isHydrated,
    clearAuth,
    setAuth,
  };
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (data) => {
      setAuth(data);
      toast.success(`Welcome back, ${data.user.firstName}!`);
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshToken, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authService.logout({ refreshToken }).catch(() => undefined);
      }
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      toast.success('You have been logged out.');
      navigate(routes.login, { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => authService.changePassword(payload),
    onSuccess: () => {
      toast.success('Password changed successfully.');
    },
  });
}
