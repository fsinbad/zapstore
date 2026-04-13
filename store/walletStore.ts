import { create } from 'zustand'
import type { WalletInterface } from 'starkzap'

interface WalletState {
  wallet: WalletInterface | null
  isConnecting: boolean
  balance: string | null
  error: string | null

  setWallet: (wallet: WalletInterface | null) => void
  setConnecting: (value: boolean) => void
  setBalance: (balance: string | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  isConnecting: false,
  balance: null,
  error: null,

  setWallet: (wallet) => set({ wallet, error: null }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setBalance: (balance) => set({ balance }),
  setError: (error) => set({ error, isConnecting: false }),
  reset: () => set({ wallet: null, isConnecting: false, balance: null, error: null }),
}))
