'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight, Search, Zap, Store, ShieldCheck, Download, Sparkles } from 'lucide-react'
import { heroTextVariants, fadeIn } from '@/lib/constants/animation'
import { cn } from '@/lib/utils'

const categories = ['All', 'Templates', 'Code', 'Design', 'Writing', 'Video', 'Music', 'Other']

// Mock featured products
const featuredProducts = [
  { id: '1', slug: 'nextjs-saas-template', title: 'Next.js SaaS Starter Kit', shortDescription: 'Production-ready SaaS template with auth, billing, and dashboard', price: 49.00, category: 'Templates', creator: { username: 'devpro', avatar: 'DP' }, coverImage: null },
  { id: '2', slug: 'icon-pack-3d', title: '3D Icon Pack — 200+ Icons', shortDescription: 'Beautiful 3D rendered icons for web and mobile apps', price: 29.00, category: 'Design', creator: { username: 'designlab', avatar: 'DL' }, coverImage: null },
  { id: '3', slug: 'python-ml-course', title: 'Python ML Masterclass', shortDescription: 'Complete machine learning course with real-world projects', price: 79.00, category: 'Video', creator: { username: 'aiteacher', avatar: 'AT' }, coverImage: null },
  { id: '4', slug: 'tailwind-components', title: 'Tailwind Component Library', shortDescription: '150+ responsive components built with Tailwind CSS', price: 39.00, category: 'Code', creator: { username: 'uicraft', avatar: 'UC' }, coverImage: null },
  { id: '5', slug: 'copywriting-guide', title: 'The Copywriting Playbook', shortDescription: 'Write copy that converts — templates and frameworks included', price: 19.00, category: 'Writing', creator: { username: 'wordsmith', avatar: 'WS' }, coverImage: null },
  { id: '6', slug: 'lofi-beats-pack', title: 'Lo-Fi Beats Sample Pack', shortDescription: '50 royalty-free lo-fi beats for content creators', price: 24.00, category: 'Music', creator: { username: 'beatmaker', avatar: 'BM' }, coverImage: null },
]

function ProductCard({ product }: { product: typeof featuredProducts[0] }) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group border-border/50 bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        {/* Cover Image */}
        <div className="aspect-video bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-zap-cyan/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-muted-foreground/30" />
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="sm" className="font-bold">View Product</Button>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">{product.creator.avatar}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{product.creator.username}</span>
          </div>
          <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2">{product.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{product.shortDescription}</p>
          <div className="flex items-center justify-between pt-1">
            <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
            <span className="font-bold text-sm tabular-nums">${product.price.toFixed(2)} <span className="text-muted-foreground text-xs font-normal">USDC</span></span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = featuredProducts.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
            <Link href="/dashboard/products/new">
              <Button size="lg" className="h-12 px-8 rounded-full font-semibold group transition-all hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(92,92,255,0.3)]">
                Start Selling <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/products">
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
          {categories.map((cat) => (
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
          <Link href="/products" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
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
