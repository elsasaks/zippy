import { create } from 'zustand'
import { api, type AuthUser } from '@/lib/api'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  error: string | null

  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const user = await api.login(username, password)
      set({ user, isLoading: false })
      return true
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Login failed',
        isLoading: false,
      })
      return false
    }
  },

  logout: async () => {
    await api.logout()
    set({ user: null })
  },

  checkAuth: async () => {
    set({ isLoading: true })
    const user = await api.verifyToken()
    set({ user, isLoading: false })
  },

  clearError: () => set({ error: null }),
}))
