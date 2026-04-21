import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { withdrawals } from '@/lib/db/schema'
import { requireUser } from '@/lib/auth'
import { eq, desc } from 'drizzle-orm'

// POST /api/withdrawals — record a completed withdrawal
export async function POST(request: NextRequest) {
  const user = await requireUser(request)
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { amountUsdc, destinationAddress, txHash } = body as {
    amountUsdc: string
    destinationAddress: string
    txHash?: string
  }

  if (!amountUsdc || !destinationAddress) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [row] = await db.insert(withdrawals).values({
    userId: user.id,
    amountUsdc,
    destinationAddress,
    txHash: txHash ?? null,
  }).returning()

  return Response.json({ withdrawal: row }, { status: 201 })
}

// GET /api/withdrawals — list withdrawals for the current user
export async function GET(request: NextRequest) {
  const user = await requireUser(request)
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, user.id))
    .orderBy(desc(withdrawals.createdAt))
    .limit(50)

  return Response.json({ withdrawals: rows })
}
