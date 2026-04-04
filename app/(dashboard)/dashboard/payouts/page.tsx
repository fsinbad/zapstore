'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Wallet, Copy, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react'
import { AddressDisplay } from '@/components/shared/AddressDisplay'
import { TxLink } from '@/components/shared/TxLink'
import { CopyButton } from '@/components/shared/CopyButton'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { MOCK_WITHDRAWALS, MOCK_WALLET_ADDRESS, MOCK_WALLET_BALANCE } from '@/lib/mock-data'
import type { Withdrawal } from '@/types'

export default function PayoutsPage() {
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16 lg:pb-0">
      <PageHeader title="Wallet & Payouts" description="Manage your USDC balance and withdrawals." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Balance Card */}
          <Card className="border-border/50 bg-card overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Current Balance</CardDescription>
                  <CardTitle className="text-4xl font-bold tabular-nums mt-1"><PriceDisplay amount={MOCK_WALLET_BALANCE} suffixSize="base" /></CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Starknet Wallet</p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/50">
                  <code className="text-sm font-mono truncate flex-1">{MOCK_WALLET_ADDRESS}</code>
                  <CopyButton text={MOCK_WALLET_ADDRESS} label="" />
                </div>
                <p className="text-xs text-muted-foreground italic">Revenue arrives directly to this Privy-managed wallet at time of sale. No escrow.</p>
              </div>
            </CardContent>
          </Card>

          {/* Withdraw Form */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-primary" />
                Withdraw USDC
              </CardTitle>
              <CardDescription>Transfer funds from your embedded wallet to an external Starknet address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Destination Address</Label>
                <Input
                  placeholder="0x..."
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all font-mono"
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
                  />
                  <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary" onClick={() => setWithdrawAmount(MOCK_WALLET_BALANCE.toString())}>
                    MAX
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Available: ${MOCK_WALLET_BALANCE.toFixed(2)} USDC</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-500">
                  <p className="font-bold">Gas fee applies</p>
                  <p>Withdrawals use your own gas. Estimated: ~$0.01</p>
                </div>
              </div>

              <Button className="w-full h-12 rounded-xl font-bold" disabled={!withdrawAmount || !destinationAddress}>
                <Wallet className="w-4 h-4 mr-2" />
                Withdraw ${withdrawAmount || '0.00'} USDC
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        <div>
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {MOCK_WITHDRAWALS.map((w: Withdrawal) => (
                  <div key={w.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold"><PriceDisplay amount={w.amount} suffixSize="xs" /></span>
                      <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">{w.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>To: <AddressDisplay address={w.destination} /></p>
                      <p>Tx: <TxLink hash={w.txHash} /></p>
                      <p>{w.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
