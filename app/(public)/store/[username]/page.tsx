'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Package, Bell } from 'lucide-react'
import { ProductCard } from '@/components/shared/ProductCard'
import { GridSkeleton } from '@/components/shared/LoadingSkeletons'
import { useStoreProducts } from '@/lib/api/products'
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

function StoreHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-10 w-28 rounded-full" />
    </div>
  )
}

export default function StorePage() {
  const { username } = useParams<{ username: string }>()
  const { data, isLoading } = useStoreProducts(username)

  const profile = data?.profile as {
    username?: string
    displayName?: string
    bio?: string
    avatarUrl?: string
    createdAt?: string
  } | undefined

  const products = useMemo(
    () => (data?.products ?? []).map(mapToCardData),
    [data?.products]
  )

  const displayName = profile?.displayName ?? username
  const avatarInitial = displayName?.charAt(0).toUpperCase() ?? '?'

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 pb-16">
        <div className="container mx-auto px-4">
          <StoreHeaderSkeleton />
          <Separator className="mb-8" />
          <Skeleton className="h-6 w-48 mb-6" />
          <GridSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4">
        {/* Creator Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          <Avatar className="h-20 w-20">
            {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} />}
            <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">{avatarInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-heading font-bold tracking-tight">{displayName}</h1>
            <p className="text-muted-foreground text-sm max-w-lg">{profile?.bio ?? ''}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {profile?.createdAt && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              )}
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
        <h2 className="font-heading text-lg font-bold mb-6">Products by {displayName}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
