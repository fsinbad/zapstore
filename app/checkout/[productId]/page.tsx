'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ShieldCheck, Zap, Clock, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow'
import { useWallet } from '@/hooks/useWallet'
import { ROUTES } from '@/lib/constants/routes'

export default function CheckoutPage() {
  const { productId } = useParams<{ productId: string }>()
  const router = useRouter()
  const { isAuthenticated } = useWallet()
  const { state, orderId, error, startPurchase, retry, reset } = usePurchaseFlow()

  // Redirect to success page once purchase completes
  useEffect(() => {
    if (state === 'success' && orderId) {
      const timer = setTimeout(() => {
        router.push(ROUTES.PURCHASE_SUCCESS(orderId))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state, orderId, router])

  const handlePurchase = () => {
    if (productId) {
      startPurchase(productId)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>

        {/* Product Summary */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-12 rounded-lg bg-muted/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading font-bold text-sm">Checkout</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">Order for product {productId}</span>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment via</span>
              <span className="text-sm font-medium">USDC on Starknet</span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout States */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-6">
            {state === 'ready' && (
              <div className="space-y-4">
                <Button onClick={handlePurchase} size="lg" className="w-full h-14 text-base font-bold rounded-xl">
                  Confirm Purchase
                </Button>
                <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secured by Starknet</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Zero gas fees</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Instant delivery</span>
                </div>
              </div>
            )}

            {state === 'login' && (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
                <h3 className="font-heading font-bold">Connecting your wallet...</h3>
                <p className="text-sm text-muted-foreground">Please complete the login flow to continue</p>
              </div>
            )}

            {state === 'balance_check' && (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
                <h3 className="font-heading font-bold">Checking balance...</h3>
                <p className="text-sm text-muted-foreground">Verifying your USDC balance on Starknet</p>
              </div>
            )}

            {state === 'processing' && (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
                <h3 className="font-heading font-bold">Completing your purchase...</h3>
                <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
              </div>
            )}

            {state === 'success' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-heading font-bold">Purchase complete!</h3>
                <p className="text-sm text-muted-foreground">Redirecting to your download...</p>
                {orderId && (
                  <Link href={ROUTES.PURCHASE_SUCCESS(orderId)}>
                    <Button className="mt-4 rounded-xl gap-2">
                      Download Now <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {state === 'insufficient' && (
              <div className="text-center py-6 space-y-4">
                <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
                <h3 className="font-heading font-bold">Insufficient USDC Balance</h3>
                <p className="text-sm text-muted-foreground">You need more USDC on Starknet to complete this purchase</p>
                <div className="space-y-2 pt-2">
                  <Button variant="outline" className="w-full rounded-xl">Bridge from Ethereum</Button>
                  <Button variant="outline" className="w-full rounded-xl">Bridge via Starkgate</Button>
                  <Button variant="outline" className="w-full rounded-xl">Buy USDC directly</Button>
                </div>
                <Button variant="ghost" onClick={handlePurchase} className="mt-2 text-primary">I&apos;ve added funds</Button>
              </div>
            )}

            {state === 'error' && (
              <div className="text-center py-6 space-y-4">
                <AlertCircle className="w-10 h-10 mx-auto text-destructive" />
                <h3 className="font-heading font-bold">Payment did not complete</h3>
                <p className="text-sm text-muted-foreground">{error || 'Nothing was charged. Please try again.'}</p>
                <Button onClick={retry} className="mt-4 rounded-xl">Try Again</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By purchasing, you agree to ZapStore&apos;s Terms of Service
        </p>
      </div>
    </div>
  )
}
