'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowRight, Search, Zap, Store, ShieldCheck, Sparkles, Upload, DollarSign, Wallet, Package, CreditCard, CheckCircle2 } from 'lucide-react'
import { heroTextVariants, fadeIn } from '@/lib/constants/animation'
import { cn } from '@/lib/utils'
import { CATEGORY_FILTERS } from '@/lib/constants/categories'
import { ROUTES } from '@/lib/constants/routes'
import { ProductCard } from '@/components/shared/ProductCard'
import { GridSkeleton } from '@/components/shared/LoadingSkeletons'
import { usePrivy } from '@privy-io/react-auth'
import { useProducts } from '@/lib/api/products'
import type { ProductCardData } from '@/types'

function mapToCardData(p: {
  id: string
  slug: string
  title: string
  shortDescription: string | null
  price: string
  category: string | null
  coverImageUrl: string
  creator: { username: string | null; displayName: string | null; avatarUrl: string | null }
}): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription ?? '',
    price: Number(p.price),
    category: (p.category ?? 'Other') as ProductCardData['category'],
    coverImageUrl: p.coverImageUrl ?? null,
    creator: {
      username: p.creator.username ?? '',
      displayName: p.creator.displayName ?? p.creator.username ?? 'Anonymous',
      avatar: p.creator.displayName?.charAt(0).toUpperCase() ?? '?',
      avatarUrl: p.creator.avatarUrl,
    },
  }
}

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [heroSearch, setHeroSearch] = useState('')
  const { ready, authenticated, login } = usePrivy()
  const router = useRouter()
  // Track whether the login was triggered by "Start Selling" on this page
  const pendingSellerRedirect = useRef(false)

  // Only redirect to dashboard if login was initiated from this page's "Start Selling"
  useEffect(() => {
    if (authenticated && pendingSellerRedirect.current) {
      pendingSellerRedirect.current = false
      router.push(ROUTES.DASHBOARD)
    }
  }, [authenticated, router])

  const handleStartSelling = () => {
    if (authenticated) {
      router.push(ROUTES.DASHBOARD_PRODUCTS_NEW)
    } else {
      pendingSellerRedirect.current = true
      sessionStorage.setItem('postLoginRedirect', ROUTES.DASHBOARD)
      login()
    }
  }

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(heroSearch.trim())}`)
    }
  }

  const { data, isLoading } = useProducts({
    category: activeCategory !== 'All' ? activeCategory : undefined,
    limit: 6,
  })

  const products = useMemo(
    () => (data?.products ?? []).map(mapToCardData),
    [data?.products]
  )

  return (
    <div className="min-h-screen grid-pattern">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-zap-cyan/6 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 container max-w-5xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="inline-flex items-center gap-2 border border-primary/30 bg-primary/8 px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Powered by Starknet</span>
          </motion.div>

          <motion.h1 custom={0} initial="hidden" animate="visible" variants={heroTextVariants} className="text-4xl sm:text-6xl lg:text-8xl font-heading font-bold leading-[1.08] tracking-tight">
            Sell your work. <br />
            <span className="gradient-text">Keep 95%.</span>
          </motion.h1>

          <motion.p custom={1} initial="hidden" animate="visible" variants={heroTextVariants} className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mt-6 font-body">
            Digital products. Instant delivery. Gasless payments in USDC.<br className="hidden sm:block" /> No wallet required — anyone can buy.
          </motion.p>

          {/* Search Bar */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={heroTextVariants} className="mt-10 max-w-xl mx-auto">
            <form onSubmit={handleHeroSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search digital products..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="h-14 pl-12 pr-32 rounded-full text-base bg-card/80 border-border/50 focus:border-primary/60 shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                disabled={!heroSearch.trim()}
              >
                Search
              </button>
            </form>
          </motion.div>

          <motion.div custom={3} initial="hidden" animate="visible" variants={heroTextVariants} className="flex items-center justify-center gap-4 mt-8">
            <Button
              size="lg"
              className="h-12 px-8 rounded-full font-semibold group transition-all hover:scale-[1.03] shadow-[0_0_30px_rgba(92,92,255,0.25)] hover:shadow-[0_0_40px_rgba(92,92,255,0.45)] bg-gradient-to-r from-primary to-secondary border-0"
              onClick={handleStartSelling}
              disabled={!ready}
            >
              Start Selling <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link href={ROUTES.PRODUCTS}>
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all">
                Browse All
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass-card border-primary/10 hover:border-primary/25 transition-colors">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Gasless Checkout</CardTitle>
              <CardDescription>Buyers pay zero gas. Sign in with Google or email, pay in USDC, download instantly.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="glass-card border-secondary/10 hover:border-secondary/25 transition-colors">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 ring-1 ring-secondary/20">
                <Store className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle className="text-base">Just 5% Platform Fee</CardTitle>
              <CardDescription>No monthly fees. Pay only on sales. Revenue goes directly to your wallet.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="glass-card border-zap-cyan/10 hover:border-zap-cyan/25 transition-colors">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-zap-cyan/10 ring-1 ring-zap-cyan/20">
                <ShieldCheck className="h-5 w-5 text-zap-cyan" />
              </div>
              <CardTitle className="text-base">Self-Custodied Revenue</CardTitle>
              <CardDescription>Your keys, your funds. Withdraw anytime to any Starknet address.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it Works — Creators */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative rounded-3xl overflow-hidden border border-primary/10 bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-8 sm:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 rounded bg-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">For Creators</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-2">Start selling in minutes</h2>
            <p className="text-muted-foreground mb-10 max-w-xl">Upload once. Sell forever. Your revenue lands in your wallet — no bank, no middleman.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                { num: '01', icon: Upload, color: 'text-primary', bg: 'bg-primary/10 ring-primary/20', title: 'Upload your product', desc: 'PDFs, templates, code, courses, designs — any digital file up to 500MB.' },
                { num: '02', icon: DollarSign, color: 'text-secondary', bg: 'bg-secondary/10 ring-secondary/20', title: 'Set your price', desc: 'Price in USDC. Instant payouts. Platform takes just 5% per sale, nothing else.' },
                { num: '03', icon: Wallet, color: 'text-zap-cyan', bg: 'bg-zap-cyan/10 ring-zap-cyan/20', title: 'Earn on-chain', desc: 'Every sale hits your Starknet wallet directly. No waiting, no chargebacks.' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4 sm:flex-col sm:gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ring-1 ${step.bg}`}>
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold step-number">{step.num}</span>
                    <h3 className="font-heading font-bold mt-0.5 mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button
                className="rounded-full px-6 font-semibold bg-gradient-to-r from-primary to-secondary border-0 shadow-[0_0_20px_rgba(92,92,255,0.2)] hover:shadow-[0_0_30px_rgba(92,92,255,0.35)] hover:scale-[1.02] transition-all"
                onClick={handleStartSelling}
                disabled={!ready}
              >
                Start Selling <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works — Buyers */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative rounded-3xl overflow-hidden border border-zap-cyan/10 bg-gradient-to-bl from-zap-cyan/5 via-card to-secondary/5 p-8 sm:p-12">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-zap-cyan/8 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 rounded bg-zap-cyan" />
              <span className="text-xs font-bold uppercase tracking-widest text-zap-cyan">For Buyers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-2">Buy anything in seconds</h2>
            <p className="text-muted-foreground mb-10 max-w-xl">No crypto wallet needed to start. Sign in with Google, pay in USDC, download instantly.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                { num: '01', icon: Package, color: 'text-zap-cyan', bg: 'bg-zap-cyan/10 ring-zap-cyan/20', title: 'Browse the store', desc: 'Discover templates, guides, tools, courses, and more from independent creators.' },
                { num: '02', icon: CreditCard, color: 'text-secondary', bg: 'bg-secondary/10 ring-secondary/20', title: 'Pay with USDC', desc: 'No gas fees. Sign in with Google or email. Pay in stablecoins — fast and cheap.' },
                { num: '03', icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10 ring-primary/20', title: 'Download instantly', desc: 'Get immediate access to your purchase. No waiting, no approval queues.' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4 sm:flex-col sm:gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ring-1 ${step.bg}`}>
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold step-number">{step.num}</span>
                    <h3 className="font-heading font-bold mt-0.5 mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href={ROUTES.PRODUCTS}>
                <Button variant="outline" className="rounded-full px-6 font-semibold border-zap-cyan/30 hover:bg-zap-cyan/5 hover:border-zap-cyan/50 transition-all">
                  Browse Products <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="container mx-auto px-4 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === cat
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_15px_rgba(92,92,255,0.3)]"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40 hover:border-primary/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="container mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold">
            {activeCategory === 'All' ? 'Featured Products' : activeCategory}
          </h2>
          <Link href={ROUTES.PRODUCTS} className="text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <GridSkeleton />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">No products found in this category.</p>
            <p className="text-sm mt-1 opacity-60">Check back soon.</p>
          </div>
        )}
      </section>
    </div>
  )
}
