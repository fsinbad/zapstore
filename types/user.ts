export interface User {
  id: string
  privyUserId: string
  starknetAddress: string | null
  email: string | null
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  bio: string | null
  isCreator: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatorProfile {
  username: string
  displayName: string
  avatar: string
  bio: string
  memberSince: string
}
