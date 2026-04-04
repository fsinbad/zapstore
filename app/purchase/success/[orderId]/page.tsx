'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Download, Mail, ShoppingBag, ArrowRight } from 'lucide-react'
import { TxLink } from '@/components/shared/TxLink'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { MOCK_ORDER_CONFIRMATION } from '@/lib/mock-data'
import { ROUTES } from '@/lib/constants/routes'
import type { OrderConfirmation } from '@/types'

export default function PurchaseSuccessPage() {
  const order: OrderConfirmation = MOCK_ORDER_CONFIRMATION

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
              <p className="font-bold text-sm">{order.product.title}</p>
              <PriceDisplay amount={order.amount} className="text-2xl font-bold mt-2 inline-block" />
            </div>

            {/* Download Button */}
            <Link href={ROUTES.CLAIM(order.claimToken)} target="_blank">
              <Button size="lg" className="w-full h-14 text-base font-bold rounded-xl gap-2">
                <Download className="w-5 h-5" />
                Download {order.product.fileName}
              </Button>
            </Link>

            {/* Email confirmation */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>A copy has been sent to {order.email}</span>
            </div>

            <Separator />

            {/* Transaction */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Transaction: <TxLink hash={order.txHash} /></p>
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
