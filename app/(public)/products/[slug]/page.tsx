'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldCheck, Zap, Clock, FileText, ArrowLeft, Sparkles, Heart } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { useProduct, useStoreProducts } from '@/lib/api/products'
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow'

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function PurchaseButtonLabel({ state }: { state: string }) {
  switch (state) {
    case 'login':
      return (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          Signing in...
        </span>
      )
    case 'balance_check':
      return (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          Checking balance...
        </span>
      )
    case 'processing':
      return (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          Completing purchase...
        </span>
      )
    case 'success':
      return <>Purchase complete!</>
    case 'insufficient':
      return <>Insufficient USDC balance</>
    case 'error':
      return <>Retry Purchase</>
    default:
      return null // handled inline
  }
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-20 h-14 rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading } = useProduct(slug)
  const { state, startPurchase, retry, error: purchaseError } = usePurchaseFlow()

  const product = data?.product ?? null
  const creatorUsername = product?.creator?.username ?? ''
  const { data: storeData } = useStoreProducts(creatorUsername)
  const moreProducts = (storeData?.products ?? []).filter((p) => p.slug !== slug).slice(0, 3)

  if (isLoading || !product) {
    return <ProductDetailSkeleton />
  }

  const price = Number(product.price)
  const avatarInitial = product.creator.displayName?.charAt(0).toUpperCase() ?? '?'
  const isProcessing = state === 'login' || state === 'balance_check' || state === 'processing'

  const handleBuy = () => {
    if (state === 'error') {
      retry()
    } else {
      startPurchase(product.id)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4">
        {/* Back */}
        <Link href={ROUTES.PRODUCTS} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column (60%) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Cover Image */}
            <div className="aspect-video rounded-2xl bg-muted/30 border border-border/50 overflow-hidden relative">
              {product.coverImageUrl ? (
                <img src={product.coverImageUrl} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-zap-cyan/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-muted-foreground/20" />
                  </div>
                </>
              )}
            </div>

            {/* Preview Thumbnails */}
            {(product.previewImageUrls ?? []).length > 0 && (
              <div className="flex gap-3">
                {(product.previewImageUrls ?? []).map((url, i) => (
                  <div key={i} className="w-20 h-14 rounded-lg border border-border/50 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Product Title & Creator (mobile) */}
            <div className="lg:hidden space-y-4">
              <Badge variant="outline">{product.category}</Badge>
              <h1 className="text-2xl font-heading font-bold tracking-tight">{product.title}</h1>
              <p className="text-muted-foreground">{product.shortDescription}</p>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-heading font-bold mb-4">About this product</h2>
              <div className="prose prose-sm prose-invert max-w-none space-y-4 text-muted-foreground">
                {(product.descriptionMd ?? '').split('\n\n').map((block, i) => {
                  if (block.startsWith('## ')) return <h3 key={i} className="text-foreground font-heading font-bold text-base mt-6 mb-2">{block.replace('## ', '')}</h3>
                  if (block.startsWith('- ')) return (
                    <ul key={i} className="space-y-1">
                      {block.split('\n').map((line, j) => (
                        <li key={j} className="text-sm">{line.replace('- ', '')}</li>
                      ))}
                    </ul>
                  )
                  return <p key={i} className="text-sm leading-relaxed">{block}</p>
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {(product.tags ?? []).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
              ))}
            </div>

            {/* More by creator */}
            {moreProducts.length > 0 && (
              <div>
                <h2 className="text-lg font-heading font-bold mb-4">More by {product.creator.displayName ?? 'this creator'}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {moreProducts.map((p) => (
                    <Link key={p.id} href={ROUTES.PRODUCT(p.slug)}>
                      <Card className="border-border/50 bg-card/50 hover:border-primary/30 transition-colors">
                        <div className="aspect-video bg-muted/20 rounded-t-lg overflow-hidden">
                          {p.coverImageUrl ? (
                            <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-muted-foreground/20" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                          <p className="text-xs text-primary font-bold mt-1">${parseFloat(p.price).toFixed(2)}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column -- Purchase Panel (40%) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 space-y-6">
              {/* Title (desktop) */}
              <div className="hidden lg:block space-y-3">
                <Badge variant="outline">{product.category}</Badge>
                <h1 className="text-2xl font-heading font-bold tracking-tight">{product.title}</h1>
                <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
              </div>

              {/* Purchase Card */}
              <Card className="border-border/50 bg-card">
                <CardContent className="p-6 space-y-6">
                  {/* Price */}
                  <PriceDisplay amount={price} className="text-3xl font-bold" suffixSize="base" />

                  {/* File badge */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{product.fileName}</span>
                    <span>&middot;</span>
                    <span>{formatFileSize(product.fileSizeBytes)}</span>
                  </div>

                  {/* Buy Button */}
                  <Button
                    size="lg"
                    className="w-full h-14 text-base font-bold rounded-xl"
                    disabled={isProcessing || state === 'success' || state === 'insufficient'}
                    onClick={handleBuy}
                  >
                    {state === 'ready' ? (
                      <>Buy Now &mdash; <PriceDisplay amount={price} /></>
                    ) : (
                      <PurchaseButtonLabel state={state} />
                    )}
                  </Button>

                  {/* Error message */}
                  {state === 'error' && purchaseError && (
                    <p className="text-sm text-destructive text-center">{purchaseError}</p>
                  )}

                  {/* Trust signals */}
                  <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secured by Starknet</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant delivery</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 72h download</span>
                  </div>

                  <Separator />

                  {/* Sales count */}
                  <p className="text-center text-xs text-muted-foreground">
                    {product.salesCount} purchases
                  </p>
                </CardContent>
              </Card>

              {/* Creator Card */}
              <Card className="border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      {product.creator.avatarUrl && <AvatarImage src={product.creator.avatarUrl} />}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{avatarInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={ROUTES.STORE(product.creator.username ?? 'anonymous')} className="font-heading font-bold text-sm hover:text-primary transition-colors">
                        {product.creator.displayName ?? 'Anonymous'}
                      </Link>
                      <p className="text-xs text-muted-foreground">{product.creator.productCount ?? 0} products</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.creator.bio ?? ''}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg" asChild>
                      <Link href={ROUTES.STORE(product.creator.username ?? 'anonymous')}>View Store</Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-lg">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
