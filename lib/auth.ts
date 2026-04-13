import { NextRequest } from 'next/server'
import { privyClient } from '@/lib/privy'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { SelectUser } from '@/lib/db/schema'

export interface AuthResult {
  privyUserId: string
  user: SelectUser | null
}

/**
 * Verifies the Privy JWT from the Authorization header
 * and looks up the user in the database.
 *
 * Returns null if auth fails (caller should return 401).
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  try {
    const token = authHeader.replace('Bearer ', '')
    const claims = await privyClient.verifyAuthToken(token)
    const privyUserId = claims.userId

    // Look up user in DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.privyUserId, privyUserId))
      .limit(1)

    return { privyUserId, user: user || null }
  } catch {
    return null
  }
}

/**
 * Same as verifyAuth but requires the user to exist in DB.
 * Returns null if user not found (caller should return 401 or 403).
 */
export async function requireUser(request: NextRequest): Promise<SelectUser | null> {
  const result = await verifyAuth(request)
  return result?.user || null
}

/**
 * Requires the user to be a creator (is_creator = true).
 */
export async function requireCreator(request: NextRequest): Promise<SelectUser | null> {
  const user = await requireUser(request)
  if (!user?.isCreator) return null
  return user
}
