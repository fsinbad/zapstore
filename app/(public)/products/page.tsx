'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = ['All', 'Templates', 'Code', 'Design', 'Writing', 'Video', 'Music', 'Other']

const allProducts = [
  { id: '1', slug: 'nextjs-saas-template', title: 'Next.js SaaS Starter Kit', shortDescription: 'Production-ready SaaS template with auth, billing, and dashboard', price: 49.00, category: 'Templates', creator: { username: 'devpro', avatar: 'DP' } },
  { id: '2', slug: 'icon-pack-3d', title: '3D Icon Pack — 200+ Icons', shortDescription: 'Beautiful 3D rendered icons for web and mobile', price: 29.00, category: 'Design', creator: { username: 'designlab', avatar: 'DL' } },
  { id: '3', slug: 'python-ml-course', title: 'Python ML Masterclass', shortDescription: 'Complete ML course with real-world projects', price: 79.00, category: 'Video', creator: { username: 'aiteacher', avatar: 'AT' } },
  { id: '4', slug: 'tailwind-components', title: 'Tailwind Component Library', shortDescription: '150+ responsive components built with Tailwind CSS', price: 39.00, category: 'Code', creator: { username: 'uicraft', avatar: 'UC' } },
  { id: '5', slug: 'copywriting-guide', title: 'The Copywriting Playbook', shortDescription: 'Write copy that converts — templates included', price: 19.00, category: 'Writing', creator: { username: 'wordsmith', avatar: 'WS' } },
  { id: '6', slug: 'lofi-beats-pack', title: 'Lo-Fi Beats Sample Pack', shortDescription: '50 royalty-free lo-fi beats for content creators', price: 24.00, category: 'Music', creator: { username: 'beatmaker', avatar: 'BM' } },
  { id: '7', slug: 'react-native-kit', title: 'React Native Boilerplate', shortDescription: 'Cross-platform app starter with navigation and auth', price: 59.00, category: 'Code', creator: { username: 'mobildev', avatar: 'MD' } },
  { id: '8', slug: 'brand-identity-kit', title: 'Brand Identity Kit', shortDescription: 'Logo templates, color palettes, typography guide', price: 34.00, category: 'Design', creator: { username: 'brandco', avatar: 'BC' } },
  { id: '9', slug: 'email-templates', title: 'Email Marketing Templates', shortDescription: '25 conversion-optimized email templates', price: 15.00, category: 'Templates', creator: { username: 'emailpro', avatar: 'EP' } },
  { id: '10', slug: 'video-editing-luts', title: 'Cinematic LUTs Pack', shortDescription: '30 professional color grading LUTs', price: 22.00, category: 'Video', creator: { username: 'filmgrade', avatar: 'FG' } },
  { id: '11', slug: 'notion-templates', title: 'Notion Life OS', shortDescription: 'Complete life management system in Notion', price: 12.00, category: 'Templates', creator: { username: 'notionpro', avatar: 'NP' } },
  { id: '12', slug: 'ambient-sounds', title: 'Ambient Sound Library', shortDescription: '100 ambient sounds for focus and relaxation', price: 18.00, category: 'Music', creator: { username: 'soundscapes', avatar: 'SS' } },
]

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const filtered = allProducts
    .filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price
      if (sortBy === 'price_high') return b.price - a.price
      return 0
    })

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
              className="pl-10"
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

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="group border-border/50 bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
                <div className="aspect-video bg-muted/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-zap-cyan/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                  </div>
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
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or category filter</p>
          </div>
        )}

        {/* Load More */}
        {filtered.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
