import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, users } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

// GET /api/store/[username] — Get creator profile + published products
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params

    // Look up the user by username
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        isCreator: users.isCreator,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.isCreator) {
      return NextResponse.json({ error: 'User is not a creator' }, { status: 404 })
    }

    // Get their published products
    const creatorProducts = await db
      .select({
        id: products.id,
        slug: products.slug,
        title: products.title,
        shortDescription: products.shortDescription,
        coverImageUrl: products.coverImageUrl,
        priceUsdc: products.priceUsdc,
        category: products.category,
        tags: products.tags,
        salesCount: products.salesCount,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(and(eq(products.creatorId, user.id), eq(products.status, 'published')))
      .orderBy(desc(products.createdAt))

    return NextResponse.json({
      creator: {
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      products: creatorProducts,
    })
  } catch (error) {
    console.error('GET /api/store/[username] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
