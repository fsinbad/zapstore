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

    const rows = await db
      .select({
        id: orders.id,
        amountUsdc: orders.amountUsdc,
        status: orders.status,
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

    const purchases = rows.map((r) => ({
      id: r.id,
      amountUsdc: r.amountUsdc,
      status: r.status,
      completedAt: r.completedAt?.toISOString() ?? null,
      product: {
        title: r.productTitle,
        slug: r.productSlug,
        coverImageUrl: r.productCoverImageUrl ?? '',
        fileName: r.productFileName ?? '',
      },
      creator: {
        displayName: r.creatorDisplayName,
        username: r.creatorUsername,
      },
    }))

    return Response.json({ purchases })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
