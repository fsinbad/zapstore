'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowRight, Search, Zap, Store, ShieldCheck, Download, Sparkles } from 'lucide-react'
import { heroTextVariants, fadeIn } from '@/lib/constants/animation'
import { cn } from '@/lib/utils'
import { CATEGORY_FILTERS } from '@/lib/constants/categories'
import { ROUTES } from '@/lib/constants/routes'
import { ProductCard } from '@/components/shared/ProductCard'
import { GridSkeleton } from '@/components/shared/LoadingSkeletons'
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
      username: p.creator.username ?? 'anonymous',
      avatar: p.creator.displayName?.charAt(0).toUpperCase() ?? '?',
      avatarUrl: p.creator.avatarUrl,
    },
  }
}

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useProducts({
    category: activeCategory !== 'All' ? activeCategory : undefined,
    q: searchQuery || undefined,
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-30" />

        <div className="relative z-10 container max-w-5xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Powered by Starknet</span>
          </motion.div>

          <motion.h1 custom={0} initial="hidden" animate="visible" variants={heroTextVariants} className="text-4xl sm:text-6xl lg:text-8xl font-heading font-bold leading-[1.1] tracking-tight">
            Sell your work. <br />
            <span className="gradient-text">Keep 100%.</span>
          </motion.h1>

          <motion.p custom={1} initial="hidden" animate="visible" variants={heroTextVariants} className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mt-6 font-body">
            Digital products. Instant delivery. Gasless payments in USDC. No wallet required.
          </motion.p>

          {/* Search Bar */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={heroTextVariants} className="mt-10 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search digital products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 rounded-full text-base bg-card border-border/50 focus:border-primary/50"
              />
            </div>
          </motion.div>

          <motion.div custom={3} initial="hidden" animate="visible" variants={heroTextVariants} className="flex items-center justify-center gap-4 mt-8">
            <Link href={ROUTES.DASHBOARD_PRODUCTS_NEW}>
              <Button size="lg" className="h-12 px-8 rounded-full font-semibold group transition-all hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(92,92,255,0.3)]">
                Start Selling <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href={ROUTES.PRODUCTS}>
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-border/40 hover:bg-muted/50">
                Browse All
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass-card">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Gasless Checkout</CardTitle>
              <CardDescription>Buyers pay zero gas. Sign in with Google, pay in USDC, download instantly.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Store className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle className="text-base">0% Platform Fee</CardTitle>
              <CardDescription>No middleman. No commission. Revenue goes directly to your wallet.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-zap-cyan/10">
                <ShieldCheck className="h-5 w-5 text-zap-cyan" />
              </div>
              <CardTitle className="text-base">Self-Custodied Revenue</CardTitle>
              <CardDescription>Your keys, your funds. Withdraw anytime to any Starknet address.</CardDescription>
            </CardHeader>
          </Card>
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
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
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
          <Link href={ROUTES.PRODUCTS} className="text-sm text-primary hover:underline">
            View all
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
            <Download className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No products found in this category.</p>
          </div>
        )}
      </section>
    </div>
  )
}
