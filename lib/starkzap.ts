import { StarkZap } from 'starkzap'

const network = (process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia') as 'sepolia' | 'mainnet'

export const sdk = new StarkZap({ network })

export { network }
