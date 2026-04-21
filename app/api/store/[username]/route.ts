import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, users } from '@/lib/db/schema'
import { eq, and, desc, or } from 'drizzle-orm'

// GET /api/store/[username] — Get creator profile + published products
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params

    // Look up the user by username or ID (ID fallback for users without a username yet)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username)
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
      .where(isUUID ? or(eq(users.username, username), eq(users.id, username)) : eq(users.username, username))
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
        price: products.priceUsdc,
        category: products.category,
        tags: products.tags,
        salesCount: products.salesCount,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(and(eq(products.creatorId, user.id), eq(products.status, 'published')))
      .orderBy(desc(products.createdAt))

    // Attach creator to every product so ProductCard mapToCardData works
    const creator = {
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    }

    return NextResponse.json({
      profile: {
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      products: creatorProducts.map((p) => ({ ...p, creator })),
    })
  } catch (error) {
    console.error('GET /api/store/[username] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
