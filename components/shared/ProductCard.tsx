import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { ROUTES } from '@/lib/constants/routes'
import type { ProductCardData } from '@/types'

interface ProductCardProps {
  product: ProductCardData
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={ROUTES.PRODUCT(product.slug)}>
      <Card className="group border-border/40 bg-card card-glow overflow-hidden h-full relative">
        {/* Gradient border glow on hover */}
        <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(92,92,255,0.08), rgba(123,63,228,0.08), rgba(24,208,181,0.05))', borderRadius: 'inherit' }} />
        {/* Cover Image */}
        <div className="aspect-video bg-muted/30 relative overflow-hidden">
          {product.coverImageUrl ? (
            <img
              src={product.coverImageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-zap-cyan/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary/40" />
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <Button variant="secondary" size="sm" className="font-bold text-xs rounded-full px-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20">
              View Product →
            </Button>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              {product.creator.avatarUrl && <AvatarImage src={product.creator.avatarUrl} />}
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                {product.creator.avatar}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {product.creator.displayName.split(' ')[0]}
            </span>
          </div>
          <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2">
            {product.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.shortDescription}
          </p>
          <div className="flex items-center justify-between pt-1">
            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary/80 bg-primary/5">
              {product.category}
            </Badge>
            <PriceDisplay amount={product.price} className="font-bold text-sm tabular-nums text-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
