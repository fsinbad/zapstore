'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldCheck, Zap, Clock, FileText, ArrowLeft, Sparkles, Heart, Wallet, CheckCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { useProduct, useStoreProducts, useProductPurchaseStatus } from '@/lib/api/products'
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow'
import { WalletFundingDialog } from '@/components/shared/WalletFundingDialog'
import { useWallet } from '@/hooks/useWallet'
import { api } from '@/lib/api/client'
import { toast } from 'sonner'

/** Fetch a cross-origin URL as a blob and trigger a browser save-file dialog. */
async function triggerBlobDownload(url: string, fileName: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function PurchaseButtonLabel({ state, paymentSubmitted }: { state: string; paymentSubmitted: boolean }) {
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
      return <>Fund Wallet to Purchase</>
    case 'error':
      return <>{paymentSubmitted ? 'Confirm Purchase' : 'Retry Purchase'}</>
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
  const { state, startPurchase, retry, reset, error: purchaseError, requiredUsdc, needsStrk, paymentSubmitted, claimUrl } = usePurchaseFlow()
  const { wallet, balance, strkBalance, isAuthenticated, login, refreshBalance } = useWallet()
  const [fundingOpen, setFundingOpen] = useState(false)
  const [reissuing, setReissuing] = useState(false)
  const [freshDownloadUrl, setFreshDownloadUrl] = useState<string | null>(null)
  const [freshDownloadFileName, setFreshDownloadFileName] = useState('download')
  const [downloadTriggered, setDownloadTriggered] = useState(false)

  const { data: purchaseStatus } = useProductPurchaseStatus(slug, isAuthenticated)
  const alreadyPurchased = purchaseStatus?.purchased ?? false
  const existingOrderId = purchaseStatus?.orderId ?? null

  const handleReissueDownload = async () => {
    // Not logged in — trigger Privy auth and resume after redirect/popup completes
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingRedownloadSlug', slug)
      login()
      return
    }
    if (!existingOrderId || reissuing) return
    setReissuing(true)
    try {
      const { claimUrl: reissueClaimUrl } = await api.post<{ claimUrl: string }>(
        `/api/purchases/${existingOrderId}/reissue`
      )
      if (!reissueClaimUrl) return
      const { downloadUrl, fileName } = await api.get<{ downloadUrl: string; fileName: string }>(reissueClaimUrl)
      if (!downloadUrl) return
      await triggerBlobDownload(downloadUrl, fileName ?? 'download')
    } catch (err) {
      console.error('Reissue download failed:', err)
      toast.error('Could not prepare your download. Please try again.')
    } finally {
      setReissuing(false)
    }
  }

  const product = data?.product ?? null
  const creatorUsername = product?.creator?.username ?? ''
  const { data: storeData } = useStoreProducts(creatorUsername)
  const moreProducts = (storeData?.products ?? []).filter((p) => p.slug !== slug).slice(0, 3)

  // After login completes, auto-resume a pending redownload (for logged-out buyers).
  // Waits for existingOrderId so the purchase-status query has resolved.
  useEffect(() => {
    if (!isAuthenticated) return
    const pendingSlug = sessionStorage.getItem('pendingRedownloadSlug')
    if (!pendingSlug || pendingSlug !== slug) return
    if (!existingOrderId) return  // purchase-status query still loading
    sessionStorage.removeItem('pendingRedownloadSlug')
    handleReissueDownload()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, existingOrderId, slug])

  // If a logged-out buyer clicked "Buy Now" and got redirected through login,
  // but already owns this product — cancel the pending purchase intent so the
  // flow in usePurchaseFlow doesn't auto-resume and attempt a double charge.
  useEffect(() => {
    if (!isAuthenticated || !alreadyPurchased) return
    const pendingId = sessionStorage.getItem('pendingPurchaseProductId')
    if (pendingId && product && pendingId === product.id) {
      sessionStorage.removeItem('pendingPurchaseProductId')
    }
  }, [isAuthenticated, alreadyPurchased, product])

  // Fetch balances as soon as the wallet is available
  useEffect(() => {
    if (wallet) refreshBalance()
  }, [wallet, refreshBalance])

  // Trigger file download as soon as purchase is confirmed.
  // Saves the signed downloadUrl so the button can retry without re-consuming the claim token.
  useEffect(() => {
    if (state !== 'success' || !claimUrl) return
    fetch(claimUrl)
      .then((r) => r.json())
      .then(({ downloadUrl, fileName }: { downloadUrl?: string; fileName?: string }) => {
        if (!downloadUrl) return
        setFreshDownloadUrl(downloadUrl)
        setFreshDownloadFileName(fileName ?? 'download')
        setDownloadTriggered(true)
        triggerBlobDownload(downloadUrl, fileName ?? 'download').catch(console.error)
      })
      .catch(console.error)
  }, [state, claimUrl])

  // Open funding dialog automatically when insufficient balance detected
  useEffect(() => {
    if (state === 'insufficient') {
      setFundingOpen(true)
    }
  }, [state])

  // When payment is submitted but confirmation failed, auto-retry once.
  // A ref prevents re-triggering if the retry itself fails.
  const autoRetriedRef = useRef(false)
  useEffect(() => {
    if (state === 'error' && paymentSubmitted && !autoRetriedRef.current) {
      autoRetriedRef.current = true
      toast.loading('Payment sent — confirming your order…', { duration: 6000 })
      retry()
      return
    }
    if (state !== 'error') {
      autoRetriedRef.current = false
    }
    if (state === 'error' && purchaseError && !paymentSubmitted) {
      toast.error(purchaseError, { duration: 6000 })
    }
  }, [state, purchaseError, paymentSubmitted, retry])

  if (isLoading || !product) {
    return <ProductDetailSkeleton />
  }

  const price = Number(product.price)
  const avatarInitial = product.creator.displayName?.charAt(0).toUpperCase() ?? '?'
  const isProcessing = state === 'login' || state === 'balance_check' || state === 'processing'

  const handleBuy = () => {
    if (state === 'error') {
      retry()
    } else if (state === 'insufficient') {
      setFundingOpen(true)
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
              <div
                className="rich-text text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.descriptionMd ?? '' }}
              />
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

                  {/* Buy Button — hidden once purchase is confirmed in this session or DB */}
                  {!alreadyPurchased && state !== 'success' && (
                    <Button
                      size="lg"
                      className="w-full h-14 text-base font-bold rounded-xl"
                      disabled={isProcessing || state === 'insufficient'}
                      onClick={handleBuy}
                    >
                      {state === 'ready' ? (
                        <>Buy Now &mdash; <PriceDisplay amount={price} /></>
                      ) : (
                        <PurchaseButtonLabel state={state} paymentSubmitted={paymentSubmitted} />
                      )}
                    </Button>
                  )}

                  {/* Download button — shown after purchase (fresh or returning) */}
                  {(alreadyPurchased || state === 'success') && (
                    <div className="space-y-2">
                      <Button
                        size="lg"
                        className="w-full h-14 text-base font-bold rounded-xl"
                        disabled={reissuing}
                        onClick={
                          state === 'success' && freshDownloadUrl
                            ? () => triggerBlobDownload(freshDownloadUrl, freshDownloadFileName).catch(console.error)
                            : handleReissueDownload
                        }
                      >
                        {reissuing ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Preparing download…
                          </span>
                        ) : downloadTriggered ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Downloaded
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Download your file
                          </span>
                        )}
                      </Button>
                      {downloadTriggered && (
                        <p className="text-center text-xs text-muted-foreground">
                          Didn&apos;t download? Click above to retry.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Wallet button — always visible when authenticated */}
                  {isAuthenticated && (
                    <button
                      onClick={() => setFundingOpen(true)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 hover:border-border/60 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Wallet className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">My Wallet</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs tabular-nums">
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">${parseFloat(balance ?? '0').toFixed(2)}</span> USDC
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{parseFloat(strkBalance ?? '0').toFixed(3)}</span> STRK
                        </span>
                      </div>
                    </button>
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
                      {product.creator.username ? (
                        <Link href={ROUTES.STORE(product.creator.username)} className="font-heading font-bold text-sm hover:text-primary transition-colors">
                          {product.creator.displayName ?? product.creator.username}
                        </Link>
                      ) : (
                        <span className="font-heading font-bold text-sm">
                          {product.creator.displayName ?? 'Anonymous'}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground">{product.creator.productCount ?? 0} products</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.creator.bio ?? ''}</p>
                  <div className="flex gap-2 mt-4">
                    {product.creator.username ? (
                      <Button variant="outline" size="sm" className="flex-1 rounded-lg" asChild>
                        <Link href={ROUTES.STORE(product.creator.username)}>View Store</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1 rounded-lg" disabled>
                        View Store
                      </Button>
                    )}
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

      <WalletFundingDialog
        open={fundingOpen}
        onClose={() => setFundingOpen(false)}
        requiredUsdc={requiredUsdc ?? String(price)}
        needsStrk={needsStrk}
        onRetry={() => {
          reset()
          startPurchase(product.id)
        }}
      />
    </div>
  )
}
