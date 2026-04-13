'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Download, Mail, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'
import { TxLink } from '@/components/shared/TxLink'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { useOrder } from '@/lib/api/orders'
import { ROUTES } from '@/lib/constants/routes'

export default function PurchaseSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const searchParams = useSearchParams()
  const claimToken = searchParams.get('token')

  const { data, isLoading } = useOrder(orderId ?? '')

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  const order = data.order
  const productTitle = order.product?.title ?? 'Your product'
  const fileName = order.product?.fileName ?? 'download'
  const amount = parseFloat(order.amountUsdc)
  const txHash = order.starknetTxHash
  const downloadToken = claimToken

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-border/50 bg-card overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>

            <div>
              <h1 className="text-2xl font-heading font-bold">Purchase complete!</h1>
              <p className="text-muted-foreground mt-1 text-sm">Your download is ready</p>
            </div>

            {/* Product Info */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
              <p className="font-bold text-sm">{productTitle}</p>
              <PriceDisplay amount={amount} className="text-2xl font-bold mt-2 inline-block" />
            </div>

            {/* Download Button */}
            {downloadToken ? (
              <Link href={ROUTES.CLAIM(downloadToken)} target="_blank">
                <Button size="lg" className="w-full h-14 text-base font-bold rounded-xl gap-2">
                  <Download className="w-5 h-5" />
                  Download {fileName}
                </Button>
              </Link>
            ) : (
              <Link href={ROUTES.MY_PURCHASES}>
                <Button size="lg" className="w-full h-14 text-base font-bold rounded-xl gap-2">
                  <Download className="w-5 h-5" />
                  Go to My Purchases to download
                </Button>
              </Link>
            )}

            <Separator />

            {/* Transaction */}
            <div className="text-xs text-muted-foreground space-y-1">
              {txHash && <p>Transaction: <TxLink hash={txHash} /></p>}
              <p>Order ID: {order.id}</p>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-2 pt-2">
              <Link href={ROUTES.MY_PURCHASES}>
                <Button variant="outline" className="w-full rounded-xl gap-2">
                  <ShoppingBag className="w-4 h-4" /> View all purchases
                </Button>
              </Link>
              <Link href={ROUTES.HOME}>
                <Button variant="ghost" className="w-full rounded-xl gap-2 text-muted-foreground">
                  Continue shopping <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
