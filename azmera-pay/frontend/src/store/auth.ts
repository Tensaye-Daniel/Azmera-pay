import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { User } from '../types/auth'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  remember: boolean
  setSession: (
    accessToken: string,
    refreshToken: string,
    remember?: boolean,
  ) => void
  setUser: (user: User | null) => void
  logout: () => void
}

interface PersistedState {
  state?: { remember?: boolean }
}

const isRemembered = (value: string): boolean => {
  try {
    return (JSON.parse(value) as PersistedState).state?.remember ?? true
  } catch {
    return true
  }
}

const rememberedStorage = {
  getItem: (name: string) =>
    localStorage.getItem(name) ?? sessionStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (isRemembered(value)) {
      localStorage.setItem(name, value)
      sessionStorage.removeItem(name)
    } else {
      sessionStorage.setItem(name, value)
      localStorage.removeItem(name)
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
    sessionStorage.removeItem(name)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      remember: true,
      setSession: (accessToken, refreshToken, remember = true) =>
        set({ accessToken, refreshToken, remember }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'azmera-auth',
      storage: createJSONStorage(() => rememberedStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        remember: state.remember,
      }),
    },
  ),
)
