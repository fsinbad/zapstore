'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_FILTERS } from '@/lib/constants/categories'
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
      username: p.creator.username ?? '',
      displayName: p.creator.displayName ?? p.creator.username ?? 'Anonymous',
      avatar: p.creator.displayName?.charAt(0).toUpperCase() ?? '?',
      avatarUrl: p.creator.avatarUrl,
    },
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const debouncedQuery = useDebounce(searchQuery, 300)

  const { data, isLoading } = useProducts({
    category: activeCategory !== 'All' ? activeCategory : undefined,
    sort: sortBy,
    q: debouncedQuery || undefined,
    limit: 12,
  })

  const products = useMemo(
    () => (data?.products ?? []).map(mapToCardData),
    [data?.products]
  )

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold tracking-tight">All Products</h1>
          <p className="text-muted-foreground mt-1">Browse digital products from independent creators</p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border/50 focus:border-primary/50"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
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

        {/* Result count */}
        {!isLoading && (debouncedQuery || activeCategory !== 'All') && (
          <p className="text-xs text-muted-foreground mb-4">
            {products.length} product{products.length !== 1 ? 's' : ''}
            {debouncedQuery ? ` for "${debouncedQuery}"` : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </p>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <GridSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm mt-1 opacity-70">Try adjusting your search or category filter</p>
              </div>
            )}

            {/* Load More */}
            {products.length > 0 && (
              <div className="flex justify-center mt-12">
                <Button variant="outline" size="lg" className="rounded-full px-8 border-border/50 hover:border-primary/30">
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
