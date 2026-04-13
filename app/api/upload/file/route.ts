import { NextRequest, NextResponse } from 'next/server'
import { requireCreator } from '@/lib/auth'
import { uploadProductFile } from '@/lib/storage'
import { randomUUID } from 'crypto'

const MAX_SIZE = 500 * 1024 * 1024 // 500MB

/**
 * POST /api/upload/file
 *
 * Upload a product file to Supabase Storage (private bucket).
 * Requires creator auth. Accepts multipart form data with a single "file" field.
 * Returns { path, fileName, fileSize, fileMimeType }.
 *
 * The productId is generated here as a temp ID. The actual product record
 * will reference this path when the creator submits the product form.
 */
export async function POST(request: NextRequest) {
  const user = await requireCreator(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized — creator account required' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 500MB' },
        { status: 400 },
      )
    }

    // Use a temp product ID — will be associated with the product record on form submit
    const tempProductId = randomUUID()

    const result = await uploadProductFile(file, user.id, tempProductId)

    return NextResponse.json({
      path: result.path,
      fileName: file.name,
      fileSize: result.size,
      fileMimeType: result.mimeType,
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 },
    )
  }
}
