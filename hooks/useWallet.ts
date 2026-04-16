'use client'

import { useCallback, useEffect, useRef } from 'react'
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
  const { logout: authLogout } = useAuthStore()

  // Synchronous guards — state updates are async and can't stop burst calls
  const syncedRef = useRef(false)
  const connectingRef = useRef(false)  // true while a connect attempt is in-flight
  const attemptedRef = useRef(false)   // true after first auto-connect attempt per session

  // Sync user to DB as soon as Privy login completes — independent of wallet
  useEffect(() => {
    if (!authenticated || syncedRef.current) return
    syncedRef.current = true

    getAccessToken().then((token) => {
      if (!token) return
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ starknetAddress: null }),
      }).catch(console.error)
    })
  }, [authenticated, getAccessToken])

  // Connect Starkzap wallet after Privy auth
  const connectWallet = useCallback(async () => {
    if (!authenticated || wallet || connectingRef.current) return
    connectingRef.current = true
    setConnecting(true)
    try {
      const accessToken = await getAccessToken()

      const { wallet: starkWallet } = await sdk.onboard({
        strategy: OnboardStrategy.Privy,
        privy: {
          resolve: async () => {
            const ctxRes = await fetch('/api/auth/signer-context', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            })
            if (!ctxRes.ok) throw new Error('Failed to get signer context')
            const { walletId, publicKey } = await ctxRes.json()

            return {
              walletId,
              publicKey,
              // rawSign is called by Starkzap whenever it needs to sign a tx hash.
              // We relay to our server with the user's auth token so the endpoint
              // can verify identity before signing.
              rawSign: async (wId: string, hash: string) => {
                const signRes = await fetch('/api/auth/sign', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify({ walletId: wId, hash }),
                })
                if (!signRes.ok) throw new Error('Signing failed')
                const { signature } = await signRes.json()
                return signature
              },
            }
          },
        },
        accountPreset: 'argentXV050',
        feeMode: 'user_pays',  // user pays gas in STRK; switch to sponsored once AVNU key is set
        deploy: 'if_needed',
      })

      setWallet(starkWallet)

      // Update starknet address in DB now that we have it
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ starknetAddress: starkWallet.address.toString() }),
      })
    } catch (err) {
      console.error('Wallet connection failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setConnecting(false)
      connectingRef.current = false
    }
  }, [authenticated, wallet, getAccessToken, setWallet, setConnecting, setError])

  // Auto-connect once per auth session — attemptedRef prevents burst retries
  useEffect(() => {
    if (!authenticated || wallet || attemptedRef.current) return
    attemptedRef.current = true
    connectWallet()
  }, [authenticated, wallet, connectWallet])

  // Reset refs on logout
  const logout = useCallback(async () => {
    syncedRef.current = false
    connectingRef.current = false
    attemptedRef.current = false
    reset()
    authLogout()
    await privyLogout()
  }, [reset, authLogout, privyLogout])

  // Refresh USDC balance
  const refreshBalance = useCallback(async () => {
    if (!wallet) return null
    try {
      const presets = getPresets(wallet.getChainId())
      const usdc = presets.USDC
      const bal = await wallet.balanceOf(usdc)
      setBalance(bal.toUnit())
      return bal
    } catch (err) {
      console.error('Balance check failed:', err)
      return null
    }
  }, [wallet, setBalance])

  return {
    wallet,
    isConnecting,
    balance,
    error,
    isAuthenticated: authenticated,
    privyUser,
    login,
    logout,
    connectWallet,
    refreshBalance,
  }
}
