'use client'

import { useState, useCallback, useEffect } from 'react'
import { Amount, fromAddress, getPresets } from 'starkzap'
import { useWallet } from '@/hooks/useWallet'
import { useCreateOrder, useConfirmOrder } from '@/lib/api/orders'
import type { CheckoutState } from '@/types'

/**
 * Strips the verbose RPC param dump from starknet.js errors and returns a
 * short, human-readable message suitable for display in the UI.
 */
function parsePurchaseError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)

  // ArgentX / contract panic — extract the felt-decoded string e.g. 'Out of gas'
  const panicMatch = raw.match(/'([^']+)'\)[^"]*"/)
  if (panicMatch) {
    const inner = panicMatch[1]
    if (inner === 'Out of gas') {
      return 'Transaction failed: account validation error (fee configuration issue). Please try again.'
    }
    return `Transaction failed: ${inner}`
  }

  // Generic RPC error — take just the human line that follows the JSON param block
  const lines = raw.split('\n')
  const msgLine = lines.find((l) => /^\s+\d+:\s+/.test(l))
  if (msgLine) return msgLine.replace(/^\s+\d+:\s+/, '').trim()

  // Fallback — truncate anything absurdly long (raw JSON params etc.)
  return raw.length > 200 ? 'Payment failed. Please try again.' : raw
}

interface PurchaseFlowResult {
  state: CheckoutState
  orderId: string | null
  downloadToken: string | null
  claimUrl: string | null
  error: string | null
  requiredUsdc: string | null
  /** True when the blocker is STRK gas rather than USDC balance */
  needsStrk: boolean
  /** True after wallet.transfer() returned — payment is on-chain even if monitoring failed */
  paymentSubmitted: boolean
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
  const { wallet, isAuthenticated, login, deployIfNeeded } = useWallet()
  const createOrder = useCreateOrder()
  const confirmOrder = useConfirmOrder()

  const [state, setState] = useState<CheckoutState>('ready')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [downloadToken, setDownloadToken] = useState<string | null>(null)
  const [claimUrl, setClaimUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requiredUsdc, setRequiredUsdc] = useState<string | null>(null)
  const [needsStrk, setNeedsStrk] = useState(false)
  const [lastProductId, setLastProductId] = useState<string | null>(null)
  // Tracks the tx hash once wallet.transfer() returns — set before watching so that
  // even if monitoring throws, retry knows not to re-submit payment.
  const [pendingTxHash, setPendingTxHash] = useState<string | null>(null)
  // Synchronous in-flight guard — prevents burst double-calls before state updates
  const inFlightRef = { current: false }

  const startPurchase = useCallback(async (productId: string) => {
    // Guard against burst re-entrancy (double-click, React strict-mode, etc.)
    if (inFlightRef.current) return
    inFlightRef.current = true

    setLastProductId(productId)
    setError(null)

    // Step 1 — Auth check
    if (!isAuthenticated) {
      setState('login')
      // Store the return URL and pending product so we can resume after OAuth redirect
      sessionStorage.setItem('postLoginRedirect', window.location.pathname)
      sessionStorage.setItem('pendingPurchaseProductId', productId)
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
        setNeedsStrk(false)
        setRequiredUsdc(orderData.amountUsdc)
        setState('insufficient')
        return
      }

      // Step 4 — Deploy account on-chain if this is the buyer's first transaction.
      // Must complete before transfer — an undeployed account produces a tx hash
      // that the RPC node cannot find, causing tx.watch() to throw immediately.
      setState('processing')
      await deployIfNeeded()
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

      // Save the hash immediately — payment is now on-chain regardless of what
      // happens next. If monitoring throws, retry() will see this hash and skip
      // creating a new order + re-transferring (preventing double charges).
      const txHash = typeof tx.hash === 'string' ? tx.hash : String(tx.hash)
      setPendingTxHash(txHash)

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
              // "Transaction hash not found" is transient — the tx was just submitted
              // and the RPC node hasn't indexed it yet. Ignore and keep polling.
              const msg = err instanceof Error ? err.message : String(err)
              if (msg.toLowerCase().includes('not found')) return
              stop()
              reject(err)
            },
          },
        )
      })

      // Step 6 — Confirm order, get download token
      const confirmation = await confirmOrder.mutateAsync({
        orderId: orderData.orderId,
        txHash,
      })

      setDownloadToken(confirmation.downloadToken)
      setClaimUrl(confirmation.claimUrl)
      setPendingTxHash(null)
      setState('success')
    } catch (err) {
      console.error('Purchase flow error:', err)
      setError(parsePurchaseError(err))
      setState('error')
    } finally {
      inFlightRef.current = false
    }
  }, [isAuthenticated, wallet, login, deployIfNeeded, createOrder, confirmOrder])

  // Auto-resume purchase after login completes (popup flow)
  useEffect(() => {
    if (state === 'login' && isAuthenticated && wallet && lastProductId) {
      startPurchase(lastProductId)
    }
  }, [state, isAuthenticated, wallet, lastProductId, startPurchase])

  // Auto-resume purchase after OAuth redirect (Google sign-in full-page redirect flow)
  useEffect(() => {
    if (!isAuthenticated || !wallet) return
    const pendingId = sessionStorage.getItem('pendingPurchaseProductId')
    if (!pendingId) return
    sessionStorage.removeItem('pendingPurchaseProductId')
    startPurchase(pendingId)
  }, [isAuthenticated, wallet, startPurchase])

  // Retry after a monitoring/confirmation failure when payment was already submitted.
  // Skips order creation and transfer — goes straight to confirming the existing order.
  const retryConfirmation = useCallback(async (txHash: string, currentOrderId: string) => {
    setState('processing')
    setError(null)
    try {
      const confirmation = await confirmOrder.mutateAsync({ orderId: currentOrderId, txHash })
      setDownloadToken(confirmation.downloadToken)
      setClaimUrl(confirmation.claimUrl)
      setPendingTxHash(null)
      setState('success')
    } catch (err) {
      console.error('Confirmation retry error:', err)
      setError(parsePurchaseError(err))
      setState('error')
    }
  }, [confirmOrder])

  const retry = useCallback(() => {
    // If payment already went through, only retry the confirmation — never re-transfer.
    if (pendingTxHash && orderId) {
      retryConfirmation(pendingTxHash, orderId)
      return
    }
    if (lastProductId) {
      startPurchase(lastProductId)
    }
  }, [pendingTxHash, orderId, lastProductId, startPurchase, retryConfirmation])

  const reset = useCallback(() => {
    setState('ready')
    setOrderId(null)
    setDownloadToken(null)
    setClaimUrl(null)
    setError(null)
    setRequiredUsdc(null)
    setNeedsStrk(false)
    setPendingTxHash(null)
  }, [])

  return {
    state,
    orderId,
    downloadToken,
    claimUrl,
    error,
    requiredUsdc,
    needsStrk,
    paymentSubmitted: pendingTxHash !== null,
    startPurchase,
    retry,
    reset,
  }
}
