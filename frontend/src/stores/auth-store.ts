import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { AuthResponse, AuthUser } from '@/types';
import { authStorage, otherAuthStorage } from '@/lib/remember-me';

// createJSONStorage resolves its getStorage() callback exactly once, at this module's first
// import, and caches that Storage object for the app's lifetime. Passing `authStorage` directly
// would lock in whichever of localStorage/sessionStorage was current at load time, so toggling
// "keep me signed in" at login would silently keep writing to the old storage until a full page
// reload. This wrapper re-resolves authStorage() on every read/write instead, so a remember-me
// change takes effect immediately.
const dynamicAuthStorage: StateStorage = {
  getItem: (name) => authStorage().getItem(name),
  setItem: (name, value) => {
    authStorage().setItem(name, value);
    // Clean up any stale copy left in the other storage by a prior remember-me choice.
    otherAuthStorage().removeItem(name);
  },
  removeItem: (name) => {
    authStorage().removeItem(name);
    otherAuthStorage().removeItem(name);
  },
};

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  setAuth: (response: AuthResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isHydrated: false,
      setAuth: (response) =>
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
        }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'itam-auth',
      storage: createJSONStorage(() => dynamicAuthStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}
