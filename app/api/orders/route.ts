import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, users } from '@/lib/db/schema'
import { requireUser } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return Response.json({ error: 'productId is required' }, { status: 400 })
    }

    // Look up the product and verify it's published
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.status !== 'published') {
      return Response.json({ error: 'Product is not available for purchase' }, { status: 400 })
    }

    // Look up the creator to get their wallet address
    const [creator] = await db
      .select()
      .from(users)
      .where(eq(users.id, product.creatorId))
      .limit(1)

    if (!creator || !creator.starknetAddress) {
      return Response.json({ error: 'Creator wallet not configured' }, { status: 400 })
    }

    // Check for existing pending order (idempotent)
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.buyerId, user.id),
          eq(orders.productId, productId),
          eq(orders.status, 'pending')
        )
      )
      .limit(1)

    if (existingOrder) {
      return Response.json({
        orderId: existingOrder.id,
        creatorWallet: creator.starknetAddress,
        amountUsdc: existingOrder.amountUsdc,
      })
    }

    // Create a new pending order
    const [newOrder] = await db
      .insert(orders)
      .values({
        productId: product.id,
        buyerId: user.id,
        creatorId: product.creatorId,
        amountUsdc: product.priceUsdc,
        status: 'pending',
      })
      .returning()

    return Response.json({
      orderId: newOrder.id,
      creatorWallet: creator.starknetAddress,
      amountUsdc: newOrder.amountUsdc,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
