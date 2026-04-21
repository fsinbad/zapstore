'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { OnboardStrategy, getPresets, AvnuSwapProvider } from 'starkzap'
import { sdk } from '@/lib/starkzap'
import { useWalletStore } from '@/store/walletStore'
import { useAuthStore } from '@/store/authStore'

export function useWallet() {
  const { authenticated, user: privyUser, login, logout: privyLogout, getAccessToken } = usePrivy()
  const {
    wallet,
    isConnecting,
    balance,
    strkBalance,
    error,
    setWallet,
    setConnecting,
    setBalance,
    setStrkBalance,
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
                const freshToken = await getAccessToken()
                const signRes = await fetch('/api/auth/sign', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${freshToken}`,
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
        // OpenZeppelin is used instead of argentXV050.
        // ArgentX v0.5.0 (0x073414441...) was compiled before Starknet 0.13.5 added
        // l1_data_gas to V3 resource bounds. Sepolia now runs 0.14.1+, causing
        // __validate__ to misparse fee fields and panic "Out of gas" on every invoke.
        // OpenZeppelin is fully compatible with the current V3 transaction spec.
        accountPreset: 'openzeppelin',
        feeMode: 'sponsored',
        deploy: 'never',  // never auto-deploy — deployIfNeeded() handles this before each tx
      })

      // Patch starknet.js v9 Account.resolveDetailsWithTip to force tip=0.
      // This only affects the execute path (wallet.transfer / invoke).
      //
      // tip=0: starknet.js v9 auto-fetches a "recommendedTip" from the RPC and
      // injects it. Some account contracts panic when tip != 0 but paymaster_data=[].
      //
      // l1_gas non-zero: older account contracts can misparse resource_bounds when
      // any field is exactly 0x0, so we floor l1_gas to a safe minimum.
      const account = starkWallet.getAccount() as unknown as Record<string, unknown>
      if (account && typeof account.resolveDetailsWithTip === 'function') {
        const origResolve = (account.resolveDetailsWithTip as (...a: unknown[]) => Promise<Record<string, unknown>>).bind(account)
        account.resolveDetailsWithTip = async (details: Record<string, unknown>) => {
          const resolved = await origResolve(details)
          const rb = resolved.resourceBounds as Record<string, Record<string, unknown>> | undefined
          if (rb?.l1_gas && (rb.l1_gas.max_amount === '0x0' || rb.l1_gas.max_amount === BigInt(0) || rb.l1_gas.max_amount === 0)) {
            rb.l1_gas = { ...rb.l1_gas, max_amount: '0x1000' }
          }
          return { ...resolved, tip: BigInt(0), resourceBounds: rb ?? resolved.resourceBounds }
        }
      }

      // Register AVNU as the default swap provider so wallet.swap() / wallet.getQuote() work
      starkWallet.registerSwapProvider(new AvnuSwapProvider(), true)

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

  // Refresh USDC and STRK balances
  const refreshBalance = useCallback(async () => {
    if (!wallet) return null
    try {
      const presets = getPresets(wallet.getChainId())
      const [usdcBal, strkBal] = await Promise.all([
        wallet.balanceOf(presets.USDC),
        wallet.balanceOf(presets.STRK),
      ])
      setBalance(usdcBal.toUnit())
      setStrkBalance(strkBal.toUnit())
      return usdcBal
    } catch (err) {
      console.error('Balance check failed:', err)
      return null
    }
  }, [wallet, setBalance, setStrkBalance])

  /**
   * Deploy the embedded account on-chain if it hasn't been deployed yet.
   * Uses AVNU sponsored mode — free on Sepolia, no gas from the buyer.
   * Safe to call multiple times — idempotent.
   */
  const deployIfNeeded = useCallback(async () => {
    if (!wallet) throw new Error('Wallet not connected')
    await wallet.ensureReady({ deploy: 'if_needed', feeMode: 'sponsored' })
  }, [wallet])

  return {
    wallet,
    isConnecting,
    balance,
    strkBalance,
    error,
    isAuthenticated: authenticated,
    privyUser,
    login,
    logout,
    connectWallet,
    refreshBalance,
    deployIfNeeded,
  }
}
