'use client'

import { useCallback, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { OnboardStrategy, getPresets } from 'starkzap'
import { sdk } from '@/lib/starkzap'
import { useWalletStore } from '@/store/walletStore'
import { useAuthStore } from '@/store/authStore'

export function useWallet() {
  const { authenticated, user: privyUser, login, logout: privyLogout, getAccessToken } = usePrivy()
  const {
    wallet,
    isConnecting,
    balance,
    error,
    setWallet,
    setConnecting,
    setBalance,
    setError,
    reset,
  } = useWalletStore()
  const { setUser, logout: authLogout } = useAuthStore()

  // Connect Starkzap wallet after Privy auth
  const connectWallet = useCallback(async () => {
    if (!authenticated || wallet || isConnecting) return

    setConnecting(true)
    try {
      const accessToken = await getAccessToken()

      const { wallet: starkWallet } = await sdk.onboard({
        strategy: OnboardStrategy.Privy,
        privy: {
          resolve: async () => {
            const res = await fetch('/api/auth/signer-context', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            })
            if (!res.ok) throw new Error('Failed to get signer context')
            return res.json()
          },
        },
        accountPreset: 'argentXV050',
        feeMode: 'sponsored',
        deploy: 'if_needed',
      })

      setWallet(starkWallet)

      // Sync user to our DB
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          starknetAddress: starkWallet.address.toString(),
        }),
      })
    } catch (err) {
      console.error('Wallet connection failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }, [authenticated, wallet, isConnecting, getAccessToken, setWallet, setConnecting, setError])

  // Auto-connect when Privy auth completes
  useEffect(() => {
    if (authenticated && !wallet && !isConnecting) {
      connectWallet()
    }
  }, [authenticated, wallet, isConnecting, connectWallet])

  // Refresh USDC balance
  const refreshBalance = useCallback(async () => {
    if (!wallet) return null
    try {
      const presets = getPresets(wallet.getChainId())
      const usdc = presets.USDC
      const bal = await wallet.balanceOf(usdc)
      const formatted = bal.toFormatted(true)
      setBalance(formatted)
      return bal
    } catch (err) {
      console.error('Balance check failed:', err)
      return null
    }
  }, [wallet, setBalance])

  // Logout — disconnect everything
  const logout = useCallback(async () => {
    reset()
    authLogout()
    await privyLogout()
  }, [reset, authLogout, privyLogout])

  return {
    // State
    wallet,
    isConnecting,
    balance,
    error,
    isAuthenticated: authenticated,
    privyUser,

    // Actions
    login,
    logout,
    connectWallet,
    refreshBalance,
  }
}
