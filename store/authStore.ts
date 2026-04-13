import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isHydrated: boolean

  setUser: (user: User | null) => void
  setAuthenticated: (value: boolean) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      logout: () => set({ user: null, isAuthenticated: false }),
      hydrate: () => set({ isHydrated: true }),
    }),
    {
      name: 'zapstore-auth',
      onRehydrateStorage: () => (state) => {
        state?.hydrate()
      },
    }
  )
)
