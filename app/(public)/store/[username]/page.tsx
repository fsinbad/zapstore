'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Calendar, Package, Bell } from 'lucide-react'
import { MOCK_CREATORS, DEVPRO_PRODUCTS } from '@/lib/mock-data'
import { ProductCard } from '@/components/shared/ProductCard'

export default function StorePage() {
  const creator = MOCK_CREATORS['devpro']
  const products = DEVPRO_PRODUCTS

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4">
        {/* Creator Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">{creator.avatar}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-heading font-bold tracking-tight">{creator.displayName}</h1>
            <p className="text-muted-foreground text-sm max-w-lg">{creator.bio}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {creator.memberSince}</span>
              <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {products.length} products</span>
            </div>
          </div>
          <Button variant="outline" className="rounded-full gap-2">
            <Bell className="w-4 h-4" />
            Follow
          </Button>
        </div>

        <Separator className="mb-8" />

        {/* Product Grid */}
        <h2 className="font-heading text-lg font-bold mb-6">Products by {creator.displayName}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
