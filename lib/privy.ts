import { PrivyClient } from '@privy-io/server-auth'
import { PrivyClient as PrivyNodeClient } from '@privy-io/node'

// Used for token verification (verifyAuthToken, getUser)
export const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
)

// Used for server-side wallet creation and Starknet rawSign
export const privyNodeClient = new PrivyNodeClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
})
