import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

// ─── Types ───────────────────────────────────────────────

interface UserProfile {
  id: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  email: string | null
  isCreator: boolean
  starknetAddress: string | null
  createdAt: string
}

interface UpdateProfileInput {
  displayName?: string
  username?: string
  bio?: string
  avatarUrl?: string
}

// ─── Query Keys ──────────────────────────────────────────

export const userKeys = {
  profile: (username: string) => ['users', 'profile', username] as const,
  me: ['users', 'me'] as const,
}

// ─── Hooks ───────────────────────────────────────────────

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: () => api.get<{ user: UserProfile }>(`/api/users/${username}`),
    enabled: !!username,
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: () => api.get<{ user: UserProfile }>('/api/users/me'),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      api.patch<{ user: UserProfile }>('/api/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me })
    },
  })
}

export type { UserProfile, UpdateProfileInput }
