'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ShieldCheck, Zap, Clock, FileText, ArrowLeft, Sparkles, Heart } from 'lucide-react'

// Mock product data — in production fetched by slug via API
const mockProduct = {
  id: '1',
  slug: 'nextjs-saas-template',
  title: 'Next.js SaaS Starter Kit',
  shortDescription: 'Production-ready SaaS template with auth, billing, and dashboard',
  descriptionMd: `## What's included\n\n- **Authentication** — Email/password, OAuth, magic links\n- **Billing** — Stripe integration with subscription management\n- **Dashboard** — Admin panel with analytics\n- **Landing Page** — Conversion-optimized marketing page\n- **Email Templates** — Transactional emails via Resend\n\n## Tech Stack\n\nNext.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Stripe\n\n## Who is this for?\n\nDevelopers who want to ship their SaaS product fast without building boilerplate from scratch.`,
  price: 49.00,
  category: 'Templates',
  tags: ['nextjs', 'saas', 'typescript', 'tailwind'],
  fileName: 'nextjs-saas-starter-v2.zip',
  fileSize: '12.4 MB',
  fileMimeType: 'application/zip',
  creator: {
    username: 'devpro',
    displayName: 'DevPro Studio',
    avatar: 'DP',
    bio: 'Building production-ready developer tools',
    productCount: 8,
  },
  previewImages: [],
  salesCount: 342,
}

export default function ProductPage() {
  const [purchasing, setPurchasing] = useState(false)
  const product = mockProduct

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4">
        {/* Back */}
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column (60%) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Cover Image Gallery */}
            <div className="aspect-video rounded-2xl bg-muted/30 border border-border/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-zap-cyan/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-muted-foreground/20" />
              </div>
            </div>

            {/* Preview Thumbnails */}
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-14 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Sparkles className="w-4 h-4 text-muted-foreground/20" />
                </div>
              ))}
            </div>

            {/* Product Title & Creator (mobile) */}
            <div className="lg:hidden space-y-4">
              <Badge variant="outline">{product.category}</Badge>
              <h1 className="text-2xl font-heading font-bold tracking-tight">{product.title}</h1>
              <p className="text-muted-foreground">{product.shortDescription}</p>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-heading font-bold mb-4">About this product</h2>
              <div className="prose prose-sm prose-invert max-w-none space-y-4 text-muted-foreground">
                {product.descriptionMd.split('\n\n').map((block, i) => {
                  if (block.startsWith('## ')) return <h3 key={i} className="text-foreground font-heading font-bold text-base mt-6 mb-2">{block.replace('## ', '')}</h3>
                  if (block.startsWith('- ')) return (
                    <ul key={i} className="space-y-1">
                      {block.split('\n').map((line, j) => (
                        <li key={j} className="text-sm">{line.replace('- ', '')}</li>
                      ))}
                    </ul>
                  )
                  return <p key={i} className="text-sm leading-relaxed">{block}</p>
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
              ))}
            </div>

            {/* More by creator */}
            <div>
              <h2 className="text-lg font-heading font-bold mb-4">More by {product.creator.displayName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-border/50 bg-card/50">
                    <div className="aspect-video bg-muted/20 rounded-t-lg" />
                    <CardContent className="p-3">
                      <div className="h-4 w-2/3 bg-muted/30 rounded mb-2" />
                      <div className="h-3 w-1/3 bg-muted/20 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Purchase Panel (40%) */}
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
                  <div className="text-3xl font-bold tabular-nums">
                    ${product.price.toFixed(2)} <span className="text-lg text-muted-foreground font-normal">USDC</span>
                  </div>

                  {/* File badge */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{product.fileName}</span>
                    <span>&middot;</span>
                    <span>{product.fileSize}</span>
                  </div>

                  {/* Buy Button */}
                  <Button
                    size="lg"
                    className="w-full h-14 text-base font-bold rounded-xl"
                    disabled={purchasing}
                    onClick={() => setPurchasing(true)}
                  >
                    {purchasing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Completing purchase...
                      </span>
                    ) : (
                      <>Buy Now &mdash; ${product.price.toFixed(2)} USDC</>
                    )}
                  </Button>

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
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{product.creator.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/store/${product.creator.username}`} className="font-heading font-bold text-sm hover:text-primary transition-colors">
                        {product.creator.displayName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{product.creator.productCount} products</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.creator.bio}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg" asChild>
                      <Link href={`/store/${product.creator.username}`}>View Store</Link>
                    </Button>
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
    </div>
  )
}
