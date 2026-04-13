import { supabaseAdmin } from '@/lib/supabase'

const BUCKET = 'zapstore-products'

/**
 * Upload a product file to Supabase Storage (private bucket).
 * Files are stored at: products/{creatorId}/{productId}/{filename}
 */
export async function uploadProductFile(
  file: File,
  creatorId: string,
  productId: string,
): Promise<{ path: string; size: number; mimeType: string }> {
  const path = `products/${creatorId}/${productId}/${file.name}`

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    throw new Error(`File upload failed: ${error.message}`)
  }

  return {
    path,
    size: file.size,
    mimeType: file.type,
  }
}

/**
 * Generate a short-lived signed URL for downloading a product file.
 * Used by the /api/claim/[token] route after token validation.
 */
export async function createSignedDownloadUrl(
  filePath: string,
  expiresInSeconds = 60,
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(filePath, expiresInSeconds)

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message}`)
  }

  return data.signedUrl
}

/**
 * Delete a product file from storage.
 */
export async function deleteProductFile(filePath: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([filePath])

  if (error) {
    throw new Error(`File deletion failed: ${error.message}`)
  }
}
