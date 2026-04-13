import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, users } from '@/lib/db/schema'
import { requireCreator } from '@/lib/auth'
import { eq, desc, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const creator = await requireCreator(request)
    if (!creator) {
      return Response.json({ error: 'Unauthorized: creator access required' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const productFilter = searchParams.get('product')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build where conditions
    const conditions = [
      eq(orders.creatorId, creator.id),
      eq(orders.status, 'completed'),
    ]

    if (productFilter) {
      conditions.push(eq(orders.productId, productFilter))
    }

    const sales = await db
      .select({
        orderId: orders.id,
        productId: orders.productId,
        amountUsdc: orders.amountUsdc,
        starknetTxHash: orders.starknetTxHash,
        completedAt: orders.completedAt,
        productTitle: products.title,
        buyerAddress: users.starknetAddress,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .innerJoin(users, eq(orders.buyerId, users.id))
      .where(and(...conditions))
      .orderBy(desc(orders.completedAt))
      .limit(limit)
      .offset(offset)

    // Truncate buyer addresses for privacy
    const salesWithTruncatedAddress = sales.map((sale) => ({
      ...sale,
      buyerAddress: sale.buyerAddress
        ? `${sale.buyerAddress.slice(0, 10)}...${sale.buyerAddress.slice(-6)}`
        : null,
    }))

    return Response.json(salesWithTruncatedAddress)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
