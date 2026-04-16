import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, users } from '@/lib/db/schema'
import { requireUser } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch order with product and buyer details
    const [row] = await db
      .select({
        id: orders.id,
        productId: orders.productId,
        buyerId: orders.buyerId,
        creatorId: orders.creatorId,
        amountUsdc: orders.amountUsdc,
        starknetTxHash: orders.starknetTxHash,
        status: orders.status,
        createdAt: orders.createdAt,
        completedAt: orders.completedAt,
        productTitle: products.title,
        productSlug: products.slug,
        productCoverImageUrl: products.coverImageUrl,
        productFileName: products.fileName,
        buyerStarknetAddress: users.starknetAddress,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .innerJoin(users, eq(orders.buyerId, users.id))
      .where(eq(orders.id, id))
      .limit(1)

    if (!row) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only the buyer or creator can view the order
    if (row.buyerId !== user.id && row.creatorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    return Response.json({
      order: {
        id: row.id,
        productId: row.productId,
        buyerId: row.buyerId,
        creatorId: row.creatorId,
        amountUsdc: row.amountUsdc,
        starknetTxHash: row.starknetTxHash,
        status: row.status,
        createdAt: row.createdAt?.toISOString() ?? null,
        completedAt: row.completedAt?.toISOString() ?? null,
        product: {
          title: row.productTitle,
          slug: row.productSlug,
          coverImageUrl: row.productCoverImageUrl ?? '',
          fileName: row.productFileName ?? '',
        },
        buyer: {
          starknetAddress: row.buyerStarknetAddress,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
