import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, users, downloadTokens } from '@/lib/db/schema'
import { requireUser } from '@/lib/auth'
import { eq, sql } from 'drizzle-orm'
import { randomUUID, createHash } from 'crypto'
import { sendPurchaseConfirmation, sendSaleNotification } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { txHash } = body

    if (!txHash) {
      return Response.json({ error: 'txHash is required' }, { status: 400 })
    }

    // Fetch the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.buyerId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (order.status === 'completed') {
      return Response.json({ error: 'Order already completed' }, { status: 400 })
    }

    if (order.status !== 'pending') {
      return Response.json({ error: 'Order cannot be confirmed in its current state' }, { status: 400 })
    }

    // Update order to completed
    const now = new Date()
    await db
      .update(orders)
      .set({ status: 'completed', completedAt: now, starknetTxHash: txHash })
      .where(eq(orders.id, id))

    // Generate download token
    const rawToken = randomUUID()
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000)

    await db.insert(downloadTokens).values({ orderId: order.id, tokenHash, expiresAt })

    // Update product stats
    await db
      .update(products)
      .set({
        salesCount: sql`${products.salesCount} + 1`,
        totalRevenueUsdc: sql`${products.totalRevenueUsdc} + ${order.amountUsdc}`,
        updatedAt: now,
      })
      .where(eq(products.id, order.productId))

    const claimUrl = `/api/claim/${rawToken}`

    // Send emails (fire and forget — don't block the response)
    const [product, creator] = await Promise.all([
      db.select().from(products).where(eq(products.id, order.productId)).limit(1).then(r => r[0]),
      db.select().from(users).where(eq(users.id, order.creatorId)).limit(1).then(r => r[0]),
    ])

    if (product) {
      const buyerEmail = user.email
      const creatorEmail = creator?.email

      if (buyerEmail) {
        sendPurchaseConfirmation({
          buyerEmail,
          buyerName: user.displayName || 'there',
          productTitle: product.title,
          productSlug: product.slug,
          amountUsdc: order.amountUsdc,
          claimUrl,
          txHash,
        })
      }

      if (creatorEmail) {
        sendSaleNotification({
          creatorEmail,
          creatorName: creator?.displayName || 'Creator',
          productTitle: product.title,
          amountUsdc: order.amountUsdc,
          buyerAddress: user.starknetAddress || '',
          txHash,
        })
      }
    }

    return Response.json({ orderId: order.id, downloadToken: rawToken, claimUrl })
  } catch (error) {
    console.error('Error confirming order:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
