import { create } from 'zustand'
import type { Employee } from '../types'
import { authApi } from '../api/auth'
import type { AuthTokens } from '../api/auth'
import { employeesApi } from '../api/employees'

interface AuthState {
  employee: Employee | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loadProfile: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  employee: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null })
    try {
      const tokens: AuthTokens = await authApi.login(username, password)
      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      const raw = await employeesApi.getMe()
      const employee = { ...raw, is_manager: ['manager','admin','hr'].includes(raw.role) }
      set({ employee, isAuthenticated: true, isLoading: false })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Invalid credentials'
      set({ error: msg, isLoading: false, isAuthenticated: false })
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ employee: null, isAuthenticated: false })
  },

  loadProfile: async () => {
    set({ isLoading: true })
    try {
      const raw = await employeesApi.getMe()
      const employee = { ...raw, is_manager: ['manager','admin','hr'].includes(raw.role) }
      set({ employee, isAuthenticated: true, isLoading: false })
    } catch {
      set({ isLoading: false, isAuthenticated: false })
    }
  },

  clearError: () => set({ error: null }),
}))
