import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
      <Card className="group border-border/50 bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
        {/* Cover Image */}
        <div className="aspect-video bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-zap-cyan/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="sm" className="font-bold">
              View Product
            </Button>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                {product.creator.avatar}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {product.creator.username}
            </span>
          </div>
          <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2">
            {product.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.shortDescription}
          </p>
          <div className="flex items-center justify-between pt-1">
            <Badge variant="outline" className="text-[10px]">
              {product.category}
            </Badge>
            <PriceDisplay amount={product.price} className="font-bold text-sm tabular-nums" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
