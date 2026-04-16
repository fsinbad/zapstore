import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, users } from '@/lib/db/schema'
import { eq, and, or } from 'drizzle-orm'
import { requireCreator } from '@/lib/auth'

// GET /api/products/[slug] — Get single product by slug
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    const [row] = await db
      .select({
        id: products.id,
        slug: products.slug,
        title: products.title,
        shortDescription: products.shortDescription,
        descriptionMd: products.descriptionMd,
        coverImageUrl: products.coverImageUrl,
        previewImageUrls: products.previewImageUrls,
        fileName: products.fileName,
        fileSizeBytes: products.fileSizeBytes,
        fileMimeType: products.fileMimeType,
        price: products.priceUsdc,
        category: products.category,
        tags: products.tags,
        status: products.status,
        salesCount: products.salesCount,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        creator: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          bio: users.bio,
        },
      })
      .from(products)
      .innerJoin(users, eq(products.creatorId, users.id))
      .where(or(eq(products.slug, slug), eq(products.id, slug)))
      .limit(1)

    if (!row) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (row.status === 'deleted') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: row })
  } catch (error) {
    console.error('GET /api/products/[slug] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/products/[slug] — Update product (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireCreator(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    // Verify ownership
    const [existing] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.creatorId, user.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Product not found or not owned by you' }, { status: 404 })
    }

    if (existing.status === 'deleted') {
      return NextResponse.json({ error: 'Cannot update a deleted product' }, { status: 400 })
    }

    const body = await request.json()

    // Only allow updating specific fields
    const allowedFields = [
      'title',
      'shortDescription',
      'descriptionMd',
      'coverImageUrl',
      'previewImageUrls',
      'filePath',
      'fileName',
      'fileSizeBytes',
      'fileMimeType',
      'priceUsdc',
      'category',
      'tags',
      'status',
    ] as const

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = field === 'priceUsdc' ? String(body[field]) : body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Regenerate slug if title changed
    if (updates.title) {
      const baseSlug = (updates.title as string)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      const existingSlugs = await db
        .select({ slug: products.slug })
        .from(products)
        .where(eq(products.slug, baseSlug))

      // Only update slug if different and not taken (or taken by this product)
      if (baseSlug !== existing.slug) {
        if (existingSlugs.length === 0 || existingSlugs.every((p) => p.slug === existing.slug)) {
          updates.slug = baseSlug
        } else {
          const suffix = Date.now().toString(36).slice(-4)
          updates.slug = `${baseSlug}-${suffix}`
        }
      }
    }

    updates.updatedAt = new Date()

    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, existing.id))
      .returning()

    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error('PATCH /api/products/[slug] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/products/[slug] — Soft delete product (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireCreator(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    // Verify ownership
    const [existing] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.creatorId, user.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Product not found or not owned by you' }, { status: 404 })
    }

    if (existing.status === 'deleted') {
      return NextResponse.json({ error: 'Product already deleted' }, { status: 400 })
    }

    await db
      .update(products)
      .set({ status: 'deleted', deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(products.id, existing.id))

    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('DELETE /api/products/[slug] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
