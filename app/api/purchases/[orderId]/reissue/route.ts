import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { orders, downloadTokens } from '@/lib/db/schema'
import { requireUser } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { randomUUID, createHash } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params

    // Fetch the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // Must be the buyer
    if (order.buyerId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Order must be completed
    if (order.status !== 'completed') {
      return Response.json({ error: 'Order is not completed' }, { status: 400 })
    }

    // Check 30-day window from completion
    if (!order.completedAt) {
      return Response.json({ error: 'Order completion date not found' }, { status: 400 })
    }

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
    const windowExpiry = new Date(order.completedAt.getTime() + thirtyDaysMs)

    if (new Date() > windowExpiry) {
      return Response.json(
        { error: 'Reissue window has expired. Downloads are available for 30 days after purchase.' },
        { status: 410 }
      )
    }

    // Generate new download token
    const now = new Date()
    const rawToken = randomUUID()
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000) // 72 hours

    await db.insert(downloadTokens).values({
      orderId: order.id,
      tokenHash,
      expiresAt,
    })

    const claimUrl = `/api/claim/${rawToken}`

    return Response.json({
      downloadToken: rawToken,
      claimUrl,
    })
  } catch (error) {
    console.error('Error reissuing download token:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
