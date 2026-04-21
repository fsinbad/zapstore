import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { orders, products } from '@/lib/db/schema'
import { requireUser } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

// GET /api/products/[slug]/purchase-status
// Returns whether the authenticated user has a completed purchase for this product.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await requireUser(request)
  if (!user) {
    return Response.json({ purchased: false, orderId: null })
  }

  const { slug } = await params

  const [row] = await db
    .select({ orderId: orders.id })
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .where(
      and(
        eq(products.slug, slug),
        eq(orders.buyerId, user.id),
        eq(orders.status, 'completed')
      )
    )
    .limit(1)

  return Response.json({
    purchased: !!row,
    orderId: row?.orderId ?? null,
  })
}
