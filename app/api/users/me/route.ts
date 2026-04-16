import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'

// GET /api/users/me — Fetch own profile
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        email: user.email,
        isCreator: user.isCreator,
        starknetAddress: user.starknetAddress,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('GET /api/users/me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/users/me — Update own profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const allowedFields = ['displayName', 'username', 'bio', 'avatarUrl'] as const
    const updates: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Validate username format if being updated
    if (updates.username) {
      const username = updates.username as string
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
        return NextResponse.json(
          { error: 'Username must be 3-30 characters, alphanumeric, hyphens, or underscores' },
          { status: 400 },
        )
      }

      // Check uniqueness
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1)

      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    updates.updatedAt = new Date()

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        email: users.email,
        isCreator: users.isCreator,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('PATCH /api/users/me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
