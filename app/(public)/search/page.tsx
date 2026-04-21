'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, Sparkles, TrendingUp } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { CATEGORY_FILTERS } from '@/lib/constants/categories'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { useProducts } from '@/lib/api/products'
import { cn } from '@/lib/utils'
import Link from 'next/link'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function SearchPageInner() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQ)
  const [activeCategory, setActiveCategory] = useState('All')
  const debouncedQuery = useDebounce(query, 300)

  const hasQuery = debouncedQuery.length > 0

  const { data, isLoading } = useProducts(
    hasQuery
      ? {
          q: debouncedQuery,
          category: activeCategory !== 'All' ? activeCategory : undefined,
        }
      : { q: undefined, limit: 0 }
  )

  const results = useMemo(() => {
    if (!hasQuery) return []
    return data?.products ?? []
  }, [data?.products, hasQuery])

  const isSearching = hasQuery && isLoading

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-heading font-bold tracking-tight text-center mb-2">Search Products</h1>
        <p className="text-center text-muted-foreground text-sm mb-8">Discover digital products from independent creators</p>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          {isSearching && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          )}
          <Input
            type="text"
            placeholder="Search by title, description, or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 pl-12 pr-12 rounded-full text-base bg-card/80 border-border/50 focus:border-primary/60 shadow-lg"
            autoFocus
          />
        </div>

        {/* Category Pills */}
        {hasQuery && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  activeCategory === cat
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_12px_rgba(92,92,255,0.25)]"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Empty state — no query */}
        {!hasQuery && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/8 ring-1 ring-primary/15 mb-4">
              <TrendingUp className="w-7 h-7 text-primary/60" />
            </div>
            <p className="text-base font-medium">Start typing to search</p>
            <p className="text-sm mt-1 opacity-70">Search across all digital products on ZapStore</p>
          </div>
        )}

        {/* No results */}
        {hasQuery && !isSearching && results.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-base font-medium">No results for &ldquo;{debouncedQuery}&rdquo;</p>
            <p className="text-sm mt-1 opacity-70">Try a different search term or browse all products</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !isSearching && (
          <>
            <p className="text-xs text-muted-foreground mb-4 px-1">
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{debouncedQuery}&rdquo;
            </p>
            <div className="space-y-3">
              {results.map((product) => (
                <Link key={product.id} href={ROUTES.PRODUCT(product.slug)}>
                  <Card className="border-border/40 bg-card hover:border-primary/20 hover:bg-muted/20 transition-all group">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl bg-gradient-to-br from-primary/10 via-secondary/10 to-zap-cyan/10 overflow-hidden flex items-center justify-center flex-shrink-0 border border-border/30">
                        {product.coverImageUrl ? (
                          <img src={product.coverImageUrl} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-primary/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-bold text-sm truncate group-hover:text-primary transition-colors">{product.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-4 w-4">
                            {product.creator.avatarUrl && (
                              <img src={product.creator.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                            )}
                            <AvatarFallback className="text-[6px] bg-primary/10 text-primary font-bold">
                              {product.creator.displayName?.charAt(0).toUpperCase() ?? '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {(product.creator.displayName ?? product.creator.username ?? 'Anonymous').split(' ')[0]}
                          </span>
                          <Badge variant="outline" className="text-[9px] border-primary/15 text-primary/70 bg-primary/5">{product.category}</Badge>
                        </div>
                      </div>
                      <PriceDisplay amount={Number(product.price)} className="font-bold text-sm whitespace-nowrap" suffixSize="xs" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-28" />}>
      <SearchPageInner />
    </Suspense>
  )
}
