'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Copy, Check, RefreshCw, ArrowDownUp, Loader2,
  Wallet, AlertCircle, CheckCircle2, ExternalLink, Rocket,
} from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'
import { getPresets, Amount } from 'starkzap'
import { toast } from 'sonner'

interface WalletFundingDialogProps {
  open: boolean
  onClose: () => void
  /** Called after funding — so the purchase flow can retry */
  onRetry: () => void
  /** How much USDC is required (formatted, e.g. "4.99") */
  requiredUsdc: string
  /** True when the blocker is STRK gas rather than USDC balance */
  needsStrk?: boolean
}

type SwapStatus =
  | 'idle'
  | 'quoting'
  | 'ready'
  | 'deploying'   // one-time account deployment before first tx
  | 'swapping'
  | 'watching'
  | 'done'
  | 'error'

export function WalletFundingDialog({ open, onClose, onRetry, requiredUsdc, needsStrk = false }: WalletFundingDialogProps) {
  const { wallet, balance, strkBalance, refreshBalance } = useWallet()

  const [copied, setCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Swap state
  const [strkInput, setStrkInput] = useState('')
  const [swapStatus, setSwapStatus] = useState<SwapStatus>('idle')
  const [quoteUsdc, setQuoteUsdc] = useState<string | null>(null)
  const [swapError, setSwapError] = useState<string | null>(null)

  const address = wallet?.address?.toString() ?? ''
  const shortAddress = address ? `${address.slice(0, 10)}...${address.slice(-8)}` : ''

  const hasStrk = parseFloat(strkBalance ?? '0') > 0

  // Refresh balances when dialog opens
  useEffect(() => {
    if (open && wallet) {
      refreshBalance()
    }
  }, [open, wallet, refreshBalance])

  // Debounced quote fetch when STRK input changes
  useEffect(() => {
    if (!strkInput || parseFloat(strkInput) <= 0 || !wallet) {
      setQuoteUsdc(null)
      setSwapStatus('idle')
      return
    }

    setSwapStatus('quoting')
    setQuoteUsdc(null)
    setSwapError(null)

    const timer = setTimeout(async () => {
      try {
        const presets = getPresets(wallet.getChainId())
        const amountIn = Amount.parse(strkInput, presets.STRK)
        const quote = await wallet.getQuote({
          tokenIn: presets.STRK,
          tokenOut: presets.USDC,
          amountIn,
        })
        const outAmount = Amount.fromRaw(quote.amountOutBase, presets.USDC)
        setQuoteUsdc(outAmount.toUnit())
        setSwapStatus('ready')
      } catch {
        setSwapStatus('error')
        setSwapError('Could not get a quote. Check your STRK amount or try again.')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [strkInput, wallet])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [address])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refreshBalance()
    setIsRefreshing(false)
  }, [refreshBalance])

  const handleSwap = useCallback(async () => {
    if (!wallet || !strkInput || parseFloat(strkInput) <= 0) return
    setSwapError(null)

    try {
      const presets = getPresets(wallet.getChainId())
      const amountIn = Amount.parse(strkInput, presets.STRK)

      // Deploy account on-chain if this is the first transaction (sponsored — no STRK needed).
      setSwapStatus('deploying')
      await wallet.ensureReady({ deploy: 'if_needed', feeMode: 'sponsored' })

      setSwapStatus('swapping')
      const tx = await wallet.swap(
        {
          tokenIn: presets.STRK,
          tokenOut: presets.USDC,
          amountIn,
        },
        { feeMode: 'sponsored' },
      )

      setSwapStatus('watching')

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
              // Transient "not found" — RPC node hasn't indexed the tx yet; keep polling.
              const msg = err instanceof Error ? err.message : String(err)
              if (msg.toLowerCase().includes('not found')) return
              stop()
              reject(err)
            },
          },
        )
      })

      setSwapStatus('done')
      setStrkInput('')
      setQuoteUsdc(null)
      await refreshBalance()
      toast.success('Swap complete — USDC balance updated')
    } catch (err) {
      setSwapStatus('error')
      const msg = err instanceof Error ? err.message : 'Swap failed. Please try again.'
      setSwapError(msg)
    }
  }, [wallet, strkInput, refreshBalance])

  const usdcSufficient = parseFloat(balance ?? '0') >= parseFloat(requiredUsdc)
  // Gas is sponsored — only USDC balance is required to retry a purchase
  const canRetry = usdcSufficient
  const isSwapInFlight = swapStatus === 'deploying' || swapStatus === 'swapping' || swapStatus === 'watching'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Wallet className="w-5 h-5 text-primary" />
            Fund Your Wallet
          </DialogTitle>
          <DialogDescription className="sr-only">
            Deposit USDC or STRK, or swap between tokens to fund your Starknet wallet for purchases.
          </DialogDescription>
        </DialogHeader>

        {/* Wallet address */}
        <div className="rounded-xl bg-muted/30 border border-border/40 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Starknet Wallet Address</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono text-foreground truncate">{shortAddress || 'Loading...'}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleCopy}
              disabled={!address}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Balances */}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">USDC</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${usdcSufficient ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-destructive/30 text-destructive bg-destructive/5'}`}
                >
                  {usdcSufficient ? 'Sufficient' : `Need $${requiredUsdc}`}
                </Badge>
              </div>
              <p className="text-lg font-bold tabular-nums">${parseFloat(balance ?? '0').toFixed(2)}</p>
            </div>
            <div className="space-y-1 text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">STRK</span>
                <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground">
                  For swaps
                </Badge>
              </div>
              <p className="text-lg font-bold tabular-nums">{parseFloat(strkBalance ?? '0').toFixed(4)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>


        {/* If both balances are sufficient, show retry */}
        {canRetry && (
          <div className="rounded-xl bg-green-500/8 border border-green-500/20 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-600">Ready to purchase!</p>
              <p className="text-xs text-muted-foreground">USDC and STRK balances look good.</p>
            </div>
            <Button
              size="sm"
              className="rounded-lg bg-gradient-to-r from-primary to-secondary border-0"
              onClick={() => { onClose(); onRetry() }}
            >
              Buy Now
            </Button>
          </div>
        )}

        <Tabs defaultValue="deposit">
          <TabsList className="w-full rounded-xl bg-muted/40">
            <TabsTrigger value="deposit" className="flex-1 rounded-lg">Deposit</TabsTrigger>
            <TabsTrigger value="swap" className="flex-1 rounded-lg">
              <ArrowDownUp className="w-3.5 h-3.5 mr-1.5" />
              Swap STRK → USDC
            </TabsTrigger>
          </TabsList>

          {/* DEPOSIT TAB */}
          <TabsContent value="deposit" className="space-y-4 mt-4">
            {/* Account deployment notice */}
            <div className="rounded-xl bg-primary/8 border border-primary/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm font-semibold text-primary">One-time account setup — free</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your Starknet wallet address is reserved but not yet live on-chain. The first transaction
                will automatically deploy your account at no cost — gas is sponsored by AVNU.
                You only need <span className="font-semibold text-foreground">USDC</span> to make a purchase.
              </p>
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-3">
              <p className="text-sm font-semibold">Send USDC or STRK to your wallet</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Transfer USDC or STRK from any Starknet wallet or exchange to the address above.
                USDC is used directly for purchases. STRK can be swapped to USDC using the Swap tab.
              </p>
            </div>
            <div className="rounded-xl bg-muted/30 border border-border/40 p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sepolia Testnet Faucets</p>
              <p className="text-xs text-muted-foreground">Get free test tokens to fund your wallet.</p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg text-xs w-full border-border/50 justify-start"
                  asChild
                >
                  <a href="https://starknet-faucet.vercel.app" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" /> Starknet Faucet — STRK (for gas &amp; swaps)
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg text-xs w-full border-border/50 justify-start"
                  asChild
                >
                  <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" /> Circle Faucet — USDC (direct purchase)
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* SWAP TAB */}
          <TabsContent value="swap" className="space-y-4 mt-4">
            {/* No STRK warning */}
            {!hasStrk && (
              <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  You need STRK to swap and to pay the one-time account deployment fee.
                  Get test STRK from the faucet on the Deposit tab.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">STRK to swap</label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={strkInput}
                    onChange={(e) => setStrkInput(e.target.value)}
                    className="pr-16 rounded-xl bg-muted/20 border-border/50 focus:border-primary/50 h-12"
                    disabled={isSwapInFlight}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">STRK</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Available: <span className="font-semibold text-foreground">{parseFloat(strkBalance ?? '0').toFixed(4)} STRK</span>
                </p>
              </div>

              {/* Quote display */}
              <div className="rounded-xl bg-muted/30 border border-border/40 p-3 min-h-[52px] flex items-center justify-between">
                <span className="text-xs text-muted-foreground">You receive (est.)</span>
                {swapStatus === 'quoting' && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {swapStatus === 'ready' && quoteUsdc && (
                  <span className="font-bold text-primary">${parseFloat(quoteUsdc).toFixed(2)} USDC</span>
                )}
                {swapStatus === 'idle' && (
                  <span className="text-xs text-muted-foreground">Enter STRK amount</span>
                )}
                {swapStatus === 'done' && (
                  <span className="text-xs text-green-500 font-semibold">Swap complete ✓</span>
                )}
              </div>

              {/* In-flight status */}
              {swapStatus === 'deploying' && (
                <div className="flex items-center gap-2 rounded-xl bg-primary/8 border border-primary/20 p-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-primary">Deploying your account…</p>
                    <p className="text-[10px] text-muted-foreground">One-time setup. This may take 30–60 seconds.</p>
                  </div>
                </div>
              )}

              {/* Swap error */}
              {swapStatus === 'error' && swapError && (
                <div className="flex items-start gap-2 rounded-xl bg-destructive/8 border border-destructive/20 p-3">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive break-words min-w-0">{swapError}</p>
                </div>
              )}

              {/* Swap button */}
              <Button
                className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary border-0 shadow-[0_0_20px_rgba(92,92,255,0.2)] disabled:opacity-50 disabled:shadow-none"
                onClick={handleSwap}
                disabled={
                  swapStatus !== 'ready' ||
                  !strkInput ||
                  parseFloat(strkInput) <= 0 ||
                  parseFloat(strkInput) > parseFloat(strkBalance ?? '0')
                }
              >
                {swapStatus === 'deploying' && (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deploying account…</>
                )}
                {swapStatus === 'swapping' && (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Swapping…</>
                )}
                {swapStatus === 'watching' && (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming on L2…</>
                )}
                {swapStatus === 'done' && (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Done — Refresh Balance</>
                )}
                {(swapStatus === 'idle' || swapStatus === 'quoting' || swapStatus === 'error' || swapStatus === 'ready') && (
                  <>Swap STRK → USDC</>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                Powered by AVNU · Sepolia Testnet · Slippage auto-managed
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
