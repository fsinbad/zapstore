import { StarkZap } from 'starkzap'

const network = (process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia') as 'sepolia' | 'mainnet'

// Custom RPC overrides the default Cartridge.gg endpoint.
const rpcUrl = process.env.NEXT_PUBLIC_STARKNET_RPC_URL || undefined

// Paymaster: proxy all AVNU calls through /api/paymaster so the API key
// stays server-side. The proxy forwards to NEXT_PUBLIC_AVNU_PAYMASTER_URL.
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const paymasterProxyUrl = `${appUrl}/api/paymaster`

export const sdk = new StarkZap({
  network,
  rpcUrl,
  paymaster: { nodeUrl: paymasterProxyUrl },
})

export { network }
