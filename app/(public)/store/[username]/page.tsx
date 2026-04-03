'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Calendar, Package, Sparkles, Bell } from 'lucide-react'

const mockCreator = {
  username: 'devpro',
  displayName: 'DevPro Studio',
  avatar: 'DP',
  bio: 'Building production-ready developer tools and SaaS templates. Shipping high-quality code so you can focus on what matters.',
  memberSince: 'April 2026',
  products: [
    { id: '1', slug: 'nextjs-saas-template', title: 'Next.js SaaS Starter Kit', shortDescription: 'Production-ready SaaS template', price: 49.00, category: 'Templates', salesCount: 342 },
    { id: '7', slug: 'react-native-kit', title: 'React Native Boilerplate', shortDescription: 'Cross-platform app starter', price: 59.00, category: 'Code', salesCount: 128 },
    { id: '4', slug: 'tailwind-components', title: 'Tailwind Component Library', shortDescription: '150+ responsive components', price: 39.00, category: 'Code', salesCount: 256 },
    { id: '9', slug: 'email-templates', title: 'Email Marketing Templates', shortDescription: '25 conversion-optimized templates', price: 15.00, category: 'Templates', salesCount: 89 },
  ],
}

export default function StorePage() {
  const creator = mockCreator

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
              <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {creator.products.length} products</span>
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
          {creator.products.map((product) => (
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
      </div>
    </div>
  )
}
