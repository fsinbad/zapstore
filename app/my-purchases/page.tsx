'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Download, ShoppingBag, Sparkles, ArrowLeft, Clock, Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Zap } from 'lucide-react'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { useMyPurchases, useReissueToken } from '@/lib/api/orders'
import { ROUTES } from '@/lib/constants/routes'

export default function MyPurchasesPage() {
  const { data, isLoading } = useMyPurchases()
  const reissueToken = useReissueToken()
  const [reissuingId, setReissuingId] = useState<string | null>(null)

  const purchases = data?.purchases ?? []

  const isExpired = (completedAt: string | null) => {
    if (!completedAt) return false
    const completed = new Date(completedAt)
    const expiry = new Date(completed.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expiry < new Date()
  }

  const handleDownload = async (orderId: string) => {
    setReissuingId(orderId)
    try {
      const result = await reissueToken.mutateAsync(orderId)
      if (result.claimUrl) {
        window.open(result.claimUrl, '_blank')
      }
    } catch (err) {
      console.error('Failed to reissue download token:', err)
    } finally {
      setReissuingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 font-heading font-bold text-lg">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-primary">Zap</span>
            <span className="text-foreground">Store</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href={ROUTES.HOME}><Button variant="ghost" size="sm">Back to Store</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-heading font-bold tracking-tight">My Purchases</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading your purchases...</p>
          </div>
        ) : purchases.length > 0 ? (
          <div className="space-y-4">
            {purchases.map((purchase) => {
              const expired = isExpired(purchase.completedAt)
              const creatorInitial = purchase.creator?.displayName?.[0] ?? purchase.creator?.username?.[0] ?? '?'
              const creatorName = purchase.creator?.displayName ?? purchase.creator?.username ?? 'Unknown'

              return (
                <Card key={purchase.id} className="border-border/50 bg-card hover:bg-muted/10 transition-colors">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="w-20 h-14 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-muted-foreground/30" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={ROUTES.PRODUCT(purchase.product.slug)} className="font-heading font-bold text-sm hover:text-primary transition-colors">
                          {purchase.product.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[6px] bg-primary/10 text-primary font-bold">{creatorInitial}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{creatorName}</span>
                          {purchase.completedAt && (
                            <>
                              <span className="text-xs text-muted-foreground">&middot;</span>
                              <span className="text-xs text-muted-foreground">{new Date(purchase.completedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Price + Download */}
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <PriceDisplay amount={parseFloat(purchase.amountUsdc)} className="font-bold" suffixSize="xs" />
                        {!expired ? (
                          <Button
                            size="sm"
                            className="gap-2 rounded-lg"
                            disabled={reissuingId === purchase.id}
                            onClick={() => handleDownload(purchase.id)}
                          >
                            {reissuingId === purchase.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            Download
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground gap-1">
                            <Clock className="w-3 h-3" /> Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium">No purchases yet</p>
            <p className="text-sm text-muted-foreground mt-1">Products you buy will appear here</p>
            <Link href={ROUTES.PRODUCTS}>
              <Button className="mt-6 rounded-xl">Browse Products</Button>
            </Link>
          </div>
        )}

        {/* Note about expired */}
        <p className="text-xs text-muted-foreground mt-8 text-center">
          Downloads are available for 30 days after purchase. After expiry, contact the creator for re-access.
        </p>
      </div>
    </div>
  )
}
