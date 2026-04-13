import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { uploadToIPFS } from '@/lib/pinata'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * POST /api/upload/image
 *
 * Upload a cover image or preview image to IPFS via Pinata.
 * Requires auth. Accepts multipart form data with a single "file" field.
 * Returns { url, cid }.
 */
export async function POST(request: NextRequest) {
  const user = await requireUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WEBP' },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 5MB' },
        { status: 400 },
      )
    }

    const result = await uploadToIPFS(file, `zapstore-${user.id}-${Date.now()}`)

    return NextResponse.json({
      url: result.url,
      cid: result.cid,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 },
    )
  }
}
