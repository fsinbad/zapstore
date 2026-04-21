import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, users } from '@/lib/db/schema'
import { eq, desc, and, ilike, or, sql, asc, ne } from 'drizzle-orm'
import { requireCreator } from '@/lib/auth'

// GET /api/products — List published products (or creator's own with ?mine=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const mine = searchParams.get('mine') === 'true'
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'newest'
    const q = searchParams.get('q')
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)

    // ?mine=true — return only the authenticated creator's products including drafts
    if (mine) {
      const user = await requireCreator(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const mineConditions = [
        eq(products.creatorId, user.id),
        ne(products.status, 'deleted'),
      ]
      if (q) {
        mineConditions.push(
          or(ilike(products.title, `%${q}%`), ilike(products.shortDescription, `%${q}%`))!,
        )
      }
      const myProducts = await db
        .select({
          id: products.id,
          slug: products.slug,
          title: products.title,
          shortDescription: products.shortDescription,
          coverImageUrl: products.coverImageUrl,
          price: products.priceUsdc,
          category: products.category,
          tags: products.tags,
          status: products.status,
          salesCount: products.salesCount,
          totalRevenueUsdc: products.totalRevenueUsdc,
          createdAt: products.createdAt,
          creator: {
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(products)
        .innerJoin(users, eq(products.creatorId, users.id))
        .where(and(...mineConditions))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset)

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(and(...mineConditions))

      return NextResponse.json({ products: myProducts, total: count, limit, offset })
    }

    // Build where conditions
    const conditions = [eq(products.status, 'published')]

    if (category) {
      conditions.push(eq(products.category, category.toLowerCase()))
    }

    if (q) {
      conditions.push(
        or(
          ilike(products.title, `%${q}%`),
          ilike(products.shortDescription, `%${q}%`),
        )!,
      )
    }

    // Build order clause
    let orderBy
    switch (sort) {
      case 'popular':
        orderBy = desc(products.salesCount)
        break
      case 'price_low':
        orderBy = asc(products.priceUsdc)
        break
      case 'price_high':
        orderBy = desc(products.priceUsdc)
        break
      case 'newest':
      default:
        orderBy = desc(products.createdAt)
        break
    }

    const rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        title: products.title,
        shortDescription: products.shortDescription,
        coverImageUrl: products.coverImageUrl,
        price: products.priceUsdc,
        category: products.category,
        tags: products.tags,
        status: products.status,
        salesCount: products.salesCount,
        totalRevenueUsdc: products.totalRevenueUsdc,
        createdAt: products.createdAt,
        creator: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(products)
      .innerJoin(users, eq(products.creatorId, users.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(and(...conditions))

    return NextResponse.json({ products: rows, total: count, limit, offset })
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/products — Create a new product (creator only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireCreator(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
      title,
      shortDescription,
      descriptionMd,
      coverImageUrl,
      filePath,
      fileName,
      fileSizeBytes,
      fileMimeType,
      priceUsdc,
      category,
      tags,
      status,
    } = body

    if (!title || !coverImageUrl || !filePath || !fileName || priceUsdc == null) {
      return NextResponse.json(
        { error: 'Missing required fields: title, coverImageUrl, filePath, fileName, priceUsdc' },
        { status: 400 },
      )
    }

    // Generate slug from title (kebab-case)
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Ensure uniqueness by appending a short suffix if needed
    const existing = await db
      .select({ slug: products.slug })
      .from(products)
      .where(ilike(products.slug, `${baseSlug}%`))

    let slug = baseSlug
    if (existing.some((p) => p.slug === baseSlug)) {
      const suffix = Date.now().toString(36).slice(-4)
      slug = `${baseSlug}-${suffix}`
    }

    const productStatus = status === 'published' ? 'published' : 'draft'

    const [product] = await db
      .insert(products)
      .values({
        creatorId: user.id,
        slug,
        title,
        shortDescription: shortDescription || null,
        descriptionMd: descriptionMd || null,
        coverImageUrl,
        filePath,
        fileName,
        fileSizeBytes: fileSizeBytes || null,
        fileMimeType: fileMimeType || null,
        priceUsdc: String(priceUsdc),
        category: category || null,
        tags: tags || null,
        status: productStatus,
      })
      .returning()

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('POST /api/products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
