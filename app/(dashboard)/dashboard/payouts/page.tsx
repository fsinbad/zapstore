'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Wallet, ArrowUpRight, AlertCircle, RefreshCw, Loader2,
  ExternalLink, ArrowDownUp, CheckCircle2, Sparkles,
} from 'lucide-react'
import { CopyButton } from '@/components/shared/CopyButton'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { StatsSkeleton } from '@/components/shared/LoadingSkeletons'
import { useWallet } from '@/hooks/useWallet'
import { Amount, fromAddress, getPresets } from 'starkzap'
import { api } from '@/lib/api/client'
import { toast } from 'sonner'

interface WithdrawalRecord {
  id: string
  amountUsdc: string
  destinationAddress: string
  txHash: string | null
  createdAt: string
}

type WithdrawStep = 'idle' | 'deploying' | 'sending' | 'done'
type SwapDirection = 'strk_to_usdc' | 'usdc_to_strk'
type SwapStatus = 'idle' | 'quoting' | 'ready' | 'deploying' | 'swapping' | 'watching' | 'done' | 'error'

export default function PayoutsPage() {
  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>('idle')
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  // Swap state
  const [swapDirection, setSwapDirection] = useState<SwapDirection>('strk_to_usdc')
  const [swapInput, setSwapInput] = useState('')
  const [swapStatus, setSwapStatus] = useState<SwapStatus>('idle')
  const [swapQuote, setSwapQuote] = useState<string | null>(null)
  const [swapError, setSwapError] = useState<string | null>(null)

  const { wallet, balance, strkBalance, refreshBalance, deployIfNeeded } = useWallet()
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  const walletAddress = wallet?.address?.toString() ?? ''
  const usdcBalance = balance != null ? Number(balance) : 0
  const strkAvailable = parseFloat(strkBalance ?? '0')
  const isWithdrawing = withdrawStep === 'deploying' || withdrawStep === 'sending'
  const isSwapInFlight = swapStatus === 'deploying' || swapStatus === 'swapping' || swapStatus === 'watching'

  const swapInputLabel = swapDirection === 'strk_to_usdc' ? 'STRK' : 'USDC'
  const swapOutputLabel = swapDirection === 'strk_to_usdc' ? 'USDC' : 'STRK'
  const swapInputBalance = swapDirection === 'strk_to_usdc' ? strkAvailable : usdcBalance
  const swapInputBalanceLabel = swapDirection === 'strk_to_usdc'
    ? `${strkAvailable.toFixed(4)} STRK`
    : `$${usdcBalance.toFixed(2)} USDC`

  // Only fetch balances once the wallet is connected
  useEffect(() => {
    if (wallet) refreshBalance()
  }, [wallet, refreshBalance])

  // Load withdrawal history on mount
  useEffect(() => {
    api.get<{ withdrawals: WithdrawalRecord[] }>('/api/withdrawals')
      .then(({ withdrawals }) => setWithdrawalHistory(withdrawals))
      .catch(console.error)
      .finally(() => setHistoryLoading(false))
  }, [])

  // Debounced quote fetch
  useEffect(() => {
    if (!swapInput || parseFloat(swapInput) <= 0 || !wallet) {
      setSwapQuote(null)
      setSwapStatus('idle')
      return
    }

    setSwapStatus('quoting')
    setSwapQuote(null)
    setSwapError(null)

    const timer = setTimeout(async () => {
      try {
        const presets = getPresets(wallet.getChainId())
        const tokenIn = swapDirection === 'strk_to_usdc' ? presets.STRK : presets.USDC
        const tokenOut = swapDirection === 'strk_to_usdc' ? presets.USDC : presets.STRK
        const amountIn = Amount.parse(swapInput, tokenIn)
        const quote = await wallet.getQuote({ tokenIn, tokenOut, amountIn })
        const outAmount = Amount.fromRaw(quote.amountOutBase, tokenOut)
        setSwapQuote(outAmount.toUnit())
        setSwapStatus('ready')
      } catch {
        setSwapStatus('error')
        setSwapError('Could not get a quote. Check your amount or try again.')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [swapInput, swapDirection, wallet])

  const handleFlipDirection = () => {
    setSwapDirection((d) => d === 'strk_to_usdc' ? 'usdc_to_strk' : 'strk_to_usdc')
    setSwapInput('')
    setSwapQuote(null)
    setSwapStatus('idle')
    setSwapError(null)
  }

  const handleRefresh = async () => {
    await refreshBalance()
    toast.success('Balance refreshed')
  }

  const handleSwap = useCallback(async () => {
    if (!wallet || !swapInput || parseFloat(swapInput) <= 0) return
    setSwapError(null)

    try {
      const presets = getPresets(wallet.getChainId())
      const tokenIn = swapDirection === 'strk_to_usdc' ? presets.STRK : presets.USDC
      const tokenOut = swapDirection === 'strk_to_usdc' ? presets.USDC : presets.STRK
      const amountIn = Amount.parse(swapInput, tokenIn)

      // Deploy is free — sponsored by AVNU paymaster
      setSwapStatus('deploying')
      await deployIfNeeded()

      setSwapStatus('swapping')
      const tx = await wallet.swap({ tokenIn, tokenOut, amountIn }, { feeMode: 'sponsored' })

      setSwapStatus('watching')
      await new Promise<void>((resolve, reject) => {
        const stop = tx.watch(
          ({ finality }) => {
            if (finality === 'ACCEPTED_ON_L2') { stop(); resolve() }
          },
          {
            pollIntervalMs: 5000,
            timeoutMs: 180000,
            onError: (err: unknown) => {
              const msg = err instanceof Error ? err.message : String(err)
              if (msg.toLowerCase().includes('not found')) return
              stop()
              reject(err)
            },
          },
        )
      })

      setSwapStatus('done')
      setSwapInput('')
      setSwapQuote(null)
      await refreshBalance()
      toast.success(`Swap complete — ${swapOutputLabel} balance updated`)
    } catch (err) {
      setSwapStatus('error')
      setSwapError(err instanceof Error ? err.message : 'Swap failed. Please try again.')
    }
  }, [wallet, swapInput, swapDirection, deployIfNeeded, refreshBalance, swapOutputLabel])

  const handleWithdraw = async () => {
    if (!wallet || !withdrawAmount || !destinationAddress) return
    setWithdrawError(null)

    try {
      // Deploy is free — sponsored by AVNU paymaster
      setWithdrawStep('deploying')
      await deployIfNeeded()

      setWithdrawStep('sending')
      const { USDC } = getPresets(wallet.getChainId())
      const tx = await wallet.transfer(USDC, [{
        to: fromAddress(destinationAddress),
        amount: Amount.parse(withdrawAmount, USDC),
      }])

      await new Promise<void>((resolve, reject) => {
        const stop = tx.watch(
          ({ finality }) => {
            if (finality === 'ACCEPTED_ON_L2') { stop(); resolve() }
          },
          {
            pollIntervalMs: 5000,
            timeoutMs: 180000,
            onError: (err: unknown) => {
              const msg = err instanceof Error ? err.message : String(err)
              if (msg.toLowerCase().includes('not found')) return
              stop()
              reject(err)
            },
          },
        )
      })

      // Record in DB, then refresh UI
      const txHash = typeof tx.hash === 'string' ? tx.hash : tx.hash ? String(tx.hash) : undefined
      await api.post('/api/withdrawals', {
        amountUsdc: withdrawAmount,
        destinationAddress,
        txHash,
      }).catch(console.error)

      setWithdrawStep('done')
      toast.success(`Withdrawn $${withdrawAmount} USDC successfully`)

      // Refresh history
      api.get<{ withdrawals: WithdrawalRecord[] }>('/api/withdrawals')
        .then(({ withdrawals }) => setWithdrawalHistory(withdrawals))
        .catch(console.error)

      setWithdrawAmount('')
      setDestinationAddress('')
      await refreshBalance()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed. Please try again.'
      setWithdrawError(msg)
      setWithdrawStep('idle')
      toast.error('Withdrawal failed')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16 lg:pb-0">
      <PageHeader title="Wallet & Payouts" description="Manage your USDC balance, swap tokens, and withdraw funds." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Balance Card */}
          <Card className="border-border/50 bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest">USDC Balance</CardDescription>
                  {wallet == null ? (
                    <StatsSkeleton />
                  ) : balance != null ? (
                    <CardTitle className="text-4xl font-bold tabular-nums mt-1">
                      <PriceDisplay amount={usdcBalance} suffixSize="base" />
                    </CardTitle>
                  ) : (
                    <StatsSkeleton />
                  )}
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={handleRefresh} disabled={!wallet}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Starknet Wallet</p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/50">
                  <code className="text-sm font-mono truncate flex-1">
                    {walletAddress || 'Connecting wallet…'}
                  </code>
                  {walletAddress && <CopyButton text={walletAddress} label="" />}
                </div>
                <p className="text-xs text-muted-foreground italic">Revenue arrives directly to this wallet at time of sale. No escrow.</p>
              </div>

              <Separator />

              {/* Sponsored gas notice */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary">Gas-free transactions</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    All swaps and withdrawals have gas sponsored by AVNU — no STRK required.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">STRK Balance</p>
                  <p className="text-sm font-bold tabular-nums mt-0.5">
                    {wallet ? `${strkAvailable.toFixed(4)} STRK` : '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Swap to USDC if desired</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Swap Card */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownUp className="w-5 h-5 text-primary" />
                Swap Tokens
              </CardTitle>
              <CardDescription>
                Swap between USDC and STRK. Gas-free — powered by AVNU on Sepolia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Direction toggle */}
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center p-3 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">From</p>
                  <p className="text-sm font-bold mt-0.5">{swapInputLabel}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-border/50 shrink-0"
                  onClick={handleFlipDirection}
                  disabled={isSwapInFlight}
                >
                  <ArrowDownUp className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center p-3 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">To</p>
                  <p className="text-sm font-bold mt-0.5">{swapOutputLabel}</p>
                </div>
              </div>

              {/* Input */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Amount ({swapInputLabel})
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={swapInput}
                    onChange={(e) => setSwapInput(e.target.value)}
                    className="pr-20 rounded-xl bg-muted/20 border-border/50 focus:border-primary/50 h-12"
                    disabled={isSwapInFlight || !wallet}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] text-primary font-bold"
                      onClick={() => setSwapInput(swapInputBalance.toString())}
                      disabled={isSwapInFlight || !wallet}
                    >
                      MAX
                    </Button>
                    <span className="text-xs font-bold text-muted-foreground pr-1">{swapInputLabel}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Available: <span className="font-semibold text-foreground">{swapInputBalanceLabel}</span>
                </p>
              </div>

              {/* Quote */}
              <div className="rounded-xl bg-muted/30 border border-border/40 p-3 min-h-[52px] flex items-center justify-between">
                <span className="text-xs text-muted-foreground">You receive (est.)</span>
                {swapStatus === 'quoting' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {swapStatus === 'ready' && swapQuote && (
                  <span className="font-bold text-primary">
                    {swapDirection === 'strk_to_usdc'
                      ? `$${parseFloat(swapQuote).toFixed(2)} USDC`
                      : `${parseFloat(swapQuote).toFixed(4)} STRK`}
                  </span>
                )}
                {(swapStatus === 'idle' || swapStatus === 'error') && (
                  <span className="text-xs text-muted-foreground">Enter amount above</span>
                )}
                {swapStatus === 'done' && <span className="text-xs text-green-500 font-semibold">Swap complete ✓</span>}
              </div>

              {/* In-flight status */}
              {swapStatus === 'deploying' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/8 border border-primary/20">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-primary">Setting up wallet…</p>
                    <p className="text-[10px] text-muted-foreground">One-time setup, free of charge.</p>
                  </div>
                </div>
              )}
              {swapStatus === 'swapping' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/8 border border-primary/20">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <p className="text-xs font-semibold text-primary">Executing swap…</p>
                </div>
              )}
              {swapStatus === 'watching' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/8 border border-primary/20">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <p className="text-xs font-semibold text-primary">Waiting for L2 confirmation…</p>
                </div>
              )}

              {/* Swap error */}
              {swapStatus === 'error' && swapError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/8 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{swapError}</p>
                </div>
              )}

              <Button
                className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary border-0 shadow-[0_0_20px_rgba(92,92,255,0.2)] disabled:opacity-50 disabled:shadow-none"
                onClick={handleSwap}
                disabled={
                  !wallet ||
                  swapStatus !== 'ready' ||
                  !swapInput ||
                  parseFloat(swapInput) <= 0 ||
                  parseFloat(swapInput) > swapInputBalance
                }
              >
                {swapStatus === 'deploying' && <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up…</>}
                {swapStatus === 'swapping' && <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Swapping…</>}
                {swapStatus === 'watching' && <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming on L2…</>}
                {swapStatus === 'done' && <><CheckCircle2 className="w-4 h-4 mr-2" /> Done</>}
                {(swapStatus === 'idle' || swapStatus === 'quoting' || swapStatus === 'error' || swapStatus === 'ready') && (
                  <>Swap {swapInputLabel} → {swapOutputLabel}</>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                Powered by AVNU · Sepolia Testnet · Gas sponsored · Slippage auto-managed
              </p>
            </CardContent>
          </Card>

          {/* Withdraw Card */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-primary" />
                Withdraw USDC
              </CardTitle>
              <CardDescription>Transfer USDC from your embedded wallet to an external Starknet address. Gas-free.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Destination Address</Label>
                <Input
                  placeholder="0x..."
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all font-mono"
                  disabled={isWithdrawing}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount (USDC)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="h-12 pl-8 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all"
                    disabled={isWithdrawing}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary"
                    onClick={() => setWithdrawAmount(usdcBalance.toString())}
                    disabled={isWithdrawing}
                  >
                    MAX
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Available: ${usdcBalance.toFixed(2)} USDC</p>
              </div>

              {withdrawStep === 'deploying' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/8 border border-primary/20">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-primary">Setting up your wallet…</p>
                    <p className="text-[10px] text-muted-foreground">One-time free setup.</p>
                  </div>
                </div>
              )}
              {withdrawStep === 'sending' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/8 border border-primary/20">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-primary">Sending withdrawal…</p>
                    <p className="text-[10px] text-muted-foreground">Waiting for L2 confirmation.</p>
                  </div>
                </div>
              )}
              {withdrawStep === 'done' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/8 border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-xs font-semibold text-green-600">Withdrawal sent successfully.</p>
                </div>
              )}

              {withdrawError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/8 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{withdrawError}</p>
                </div>
              )}

              <Button
                className="w-full h-12 rounded-xl font-bold"
                disabled={!withdrawAmount || !destinationAddress || isWithdrawing || usdcBalance <= 0 || !wallet}
                onClick={handleWithdraw}
              >
                {withdrawStep === 'deploying' && <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up…</>}
                {withdrawStep === 'sending' && <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>}
                {(withdrawStep === 'idle' || withdrawStep === 'done') && (
                  <><Wallet className="w-4 h-4 mr-2" /> Withdraw ${withdrawAmount || '0.00'} USDC</>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                Gas sponsored by AVNU · No STRK required
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Withdrawal History */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {historyLoading ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : withdrawalHistory.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">No withdrawals yet</p>
              ) : (
                <ul className="divide-y divide-border/50">
                  {withdrawalHistory.map((w) => (
                    <li key={w.id} className="px-4 py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold tabular-nums">${parseFloat(w.amountUsdc).toFixed(2)} USDC</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(w.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground truncate">
                        → {w.destinationAddress.slice(0, 10)}…{w.destinationAddress.slice(-6)}
                      </p>
                      {w.txHash && (
                        <p className="text-[10px] font-mono text-muted-foreground truncate">
                          tx: {w.txHash.slice(0, 10)}…{w.txHash.slice(-6)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Faucets */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Testnet Faucets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">Claim free test tokens on Sepolia.</p>
              <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg text-xs justify-start" asChild>
                <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" /> Circle Faucet — USDC
                </a>
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2 rounded-lg text-xs justify-start" asChild>
                <a href="https://starknet-faucet.vercel.app" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" /> Starknet Faucet — STRK
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
