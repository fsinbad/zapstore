import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { downloadTokens, orders, products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Hash the incoming token to look it up
    const tokenHash = createHash('sha256').update(token).digest('hex')

    // Look up the download token
    const [downloadToken] = await db
      .select()
      .from(downloadTokens)
      .where(eq(downloadTokens.tokenHash, tokenHash))
      .limit(1)

    if (!downloadToken) {
      return Response.json({ error: 'Invalid download token' }, { status: 404 })
    }

    // Check if already used
    if (downloadToken.usedAt) {
      return Response.json({ error: 'Download token has already been used' }, { status: 410 })
    }

    // Check if expired
    if (new Date() > downloadToken.expiresAt) {
      return Response.json({ error: 'Download token has expired' }, { status: 410 })
    }

    // Look up the order and product to get the file path
    const [order] = await db
      .select({
        id: orders.id,
        productId: orders.productId,
        filePath: products.filePath,
        fileName: products.fileName,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.id, downloadToken.orderId))
      .limit(1)

    if (!order || !order.filePath) {
      return Response.json({ error: 'Product file not found' }, { status: 404 })
    }

    // Generate a signed URL from Supabase Storage (60s expiry)
    const { data, error } = await supabaseAdmin
      .storage
      .from('zapstore-products')
      .createSignedUrl(order.filePath, 60)

    if (error || !data?.signedUrl) {
      console.error('Error generating signed URL:', error)
      return Response.json({ error: 'Failed to generate download URL' }, { status: 500 })
    }

    // Mark token as used
    await db
      .update(downloadTokens)
      .set({ usedAt: new Date() })
      .where(eq(downloadTokens.id, downloadToken.id))

    // Redirect to the signed URL
    return Response.redirect(data.signedUrl, 302)
  } catch (error) {
    console.error('Error processing claim:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
