'use client'

import { useState, useCallback } from 'react'
import { Amount, fromAddress, getPresets } from 'starkzap'
import { useWallet } from '@/hooks/useWallet'
import { useCreateOrder, useConfirmOrder } from '@/lib/api/orders'
import type { CheckoutState } from '@/types'

interface PurchaseFlowResult {
  state: CheckoutState
  orderId: string | null
  downloadToken: string | null
  claimUrl: string | null
  error: string | null
  startPurchase: (productId: string) => Promise<void>
  retry: () => void
  reset: () => void
}

/**
 * Encapsulates the full checkout state machine:
 * 1. Auth check → Privy login if needed
 * 2. Create pending order via API
 * 3. Balance check via wallet.balanceOf(USDC)
 * 4. Payment via wallet.transfer(USDC, ..., { feeMode: 'sponsored' })
 * 5. Watch for L2 finality via tx.watch()
 * 6. Confirm order via API → get download token
 */
export function usePurchaseFlow(): PurchaseFlowResult {
  const { wallet, isAuthenticated, login } = useWallet()
  const createOrder = useCreateOrder()
  const confirmOrder = useConfirmOrder()

  const [state, setState] = useState<CheckoutState>('ready')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [downloadToken, setDownloadToken] = useState<string | null>(null)
  const [claimUrl, setClaimUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastProductId, setLastProductId] = useState<string | null>(null)

  const startPurchase = useCallback(async (productId: string) => {
    setLastProductId(productId)
    setError(null)

    // Step 1 — Auth check
    if (!isAuthenticated) {
      setState('login')
      login()
      return
    }

    if (!wallet) {
      setState('login')
      return
    }

    try {
      // Step 2 — Create pending order
      setState('balance_check')
      const orderData = await createOrder.mutateAsync(productId)
      setOrderId(orderData.orderId)

      // Step 3 — Balance check
      const presets = getPresets(wallet.getChainId())
      const USDC = presets.USDC
      const balance = await wallet.balanceOf(USDC)
      const requiredAmount = Amount.parse(orderData.amountUsdc, USDC)

      if (balance.lt(requiredAmount)) {
        setState('insufficient')
        return
      }

      // Step 4 — Payment: split between creator and platform fee
      setState('processing')
      const creatorAmount = Amount.parse(orderData.creatorAmountUsdc, USDC)
      const transfers: { to: ReturnType<typeof fromAddress>; amount: typeof creatorAmount }[] = [
        { to: fromAddress(orderData.creatorWallet), amount: creatorAmount },
      ]
      if (
        orderData.feeRecipient &&
        parseFloat(orderData.feeAmountUsdc) > 0
      ) {
        transfers.push({
          to: fromAddress(orderData.feeRecipient),
          amount: Amount.parse(orderData.feeAmountUsdc, USDC),
        })
      }
      const tx = await wallet.transfer(USDC, transfers)

      // Step 5 — Watch for L2 finality
      await new Promise<void>((resolve, reject) => {
        const stop = tx.watch(
          ({ finality }) => {
            if (finality === 'ACCEPTED_ON_L2') {
              stop()
              resolve()
            }
          },
          {
            pollIntervalMs: 5000,
            timeoutMs: 180000,
            onError: (err: unknown) => {
              stop()
              reject(err)
            },
          },
        )
      })

      // Step 6 — Confirm order, get download token
      const txHash = typeof tx.hash === 'string' ? tx.hash : String(tx.hash)
      const confirmation = await confirmOrder.mutateAsync({
        orderId: orderData.orderId,
        txHash,
      })

      setDownloadToken(confirmation.downloadToken)
      setClaimUrl(confirmation.claimUrl)
      setState('success')
    } catch (err) {
      console.error('Purchase flow error:', err)
      setError(err instanceof Error ? err.message : 'Payment did not complete. Nothing was charged.')
      setState('error')
    }
  }, [isAuthenticated, wallet, login, createOrder, confirmOrder])

  const retry = useCallback(() => {
    if (lastProductId) {
      startPurchase(lastProductId)
    }
  }, [lastProductId, startPurchase])

  const reset = useCallback(() => {
    setState('ready')
    setOrderId(null)
    setDownloadToken(null)
    setClaimUrl(null)
    setError(null)
  }, [])

  return {
    state,
    orderId,
    downloadToken,
    claimUrl,
    error,
    startPurchase,
    retry,
    reset,
  }
}
