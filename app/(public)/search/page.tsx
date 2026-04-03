'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, Sparkles } from 'lucide-react'

const allProducts = [
  { id: '1', slug: 'nextjs-saas-template', title: 'Next.js SaaS Starter Kit', shortDescription: 'Production-ready SaaS template', price: 49.00, category: 'Templates', creator: { username: 'devpro', avatar: 'DP' } },
  { id: '2', slug: 'icon-pack-3d', title: '3D Icon Pack — 200+ Icons', shortDescription: 'Beautiful 3D rendered icons', price: 29.00, category: 'Design', creator: { username: 'designlab', avatar: 'DL' } },
  { id: '3', slug: 'python-ml-course', title: 'Python ML Masterclass', shortDescription: 'Complete ML course', price: 79.00, category: 'Video', creator: { username: 'aiteacher', avatar: 'AT' } },
  { id: '4', slug: 'tailwind-components', title: 'Tailwind Component Library', shortDescription: '150+ responsive components', price: 39.00, category: 'Code', creator: { username: 'uicraft', avatar: 'UC' } },
  { id: '5', slug: 'copywriting-guide', title: 'The Copywriting Playbook', shortDescription: 'Copy that converts', price: 19.00, category: 'Writing', creator: { username: 'wordsmith', avatar: 'WS' } },
  { id: '6', slug: 'lofi-beats-pack', title: 'Lo-Fi Beats Sample Pack', shortDescription: 'Royalty-free lo-fi beats', price: 24.00, category: 'Music', creator: { username: 'beatmaker', avatar: 'BM' } },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')

  const results = query.length > 0
    ? allProducts.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-heading font-bold tracking-tight text-center mb-8">Search Products</h1>

        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, description, or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 pl-12 pr-4 rounded-full text-base bg-card border-border/50 focus:border-primary/50"
            autoFocus
          />
        </div>

        {query.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Start typing to search</p>
            <p className="text-sm mt-1">Search across all digital products on ZapStore</p>
          </div>
        )}

        {query.length > 0 && results.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-6">{results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</p>
            <div className="space-y-4">
              {results.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="border-border/50 bg-card hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-bold text-sm truncate">{product.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[6px] bg-primary/10 text-primary font-bold">{product.creator.avatar}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{product.creator.username}</span>
                          <Badge variant="outline" className="text-[9px]">{product.category}</Badge>
                        </div>
                      </div>
                      <span className="font-bold text-sm tabular-nums whitespace-nowrap">${product.price.toFixed(2)} <span className="text-muted-foreground text-xs font-normal">USDC</span></span>
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
