import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, users } from '@/lib/db/schema'
import { requireUser } from '@/lib/auth'
import { eq, desc, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const purchases = await db
      .select({
        id: orders.id,
        productId: orders.productId,
        amountUsdc: orders.amountUsdc,
        starknetTxHash: orders.starknetTxHash,
        status: orders.status,
        createdAt: orders.createdAt,
        completedAt: orders.completedAt,
        productTitle: products.title,
        productSlug: products.slug,
        productCoverImageUrl: products.coverImageUrl,
        productFileName: products.fileName,
        creatorDisplayName: users.displayName,
        creatorUsername: users.username,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .innerJoin(users, eq(orders.creatorId, users.id))
      .where(
        and(
          eq(orders.buyerId, user.id),
          eq(orders.status, 'completed')
        )
      )
      .orderBy(desc(orders.completedAt))

    return Response.json(purchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
