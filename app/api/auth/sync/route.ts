import { NextRequest, NextResponse } from 'next/server'
import { privyClient } from '@/lib/privy'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/auth/sync
 *
 * Called after Privy login + Starkzap wallet connection.
 * Upserts the user into the database.
 *
 * Body: { starknetAddress: string }
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
    }

    const accessToken = authHeader.replace('Bearer ', '')
    const body = await request.json()
    const { starknetAddress } = body

    // Verify Privy token
    const verifiedClaims = await privyClient.verifyAuthToken(accessToken)
    const privyUserId = verifiedClaims.userId

    // Get Privy user details for email/name
    const privyUser = await privyClient.getUser(privyUserId)

    const emailAccount = privyUser.linkedAccounts.find(
      (account) => account.type === 'email'
    )
    const googleAccount = privyUser.linkedAccounts.find(
      (account) => account.type === 'google_oauth'
    )

    const email = emailAccount && 'address' in emailAccount
      ? emailAccount.address
      : googleAccount && 'email' in googleAccount
        ? googleAccount.email
        : null

    const displayName = googleAccount && 'name' in googleAccount
      ? googleAccount.name
      : null

    // Check if user exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.privyUserId, privyUserId))
      .limit(1)

    if (existing) {
      // Update starknet address and last login
      const [updated] = await db
        .update(users)
        .set({
          starknetAddress: starknetAddress || existing.starknetAddress,
          email: email || existing.email,
          displayName: displayName || existing.displayName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning()

      return NextResponse.json({ user: updated })
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        privyUserId,
        starknetAddress: starknetAddress || null,
        email,
        displayName,
        isCreator: false,
      })
      .returning()

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error('Auth sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    )
  }
}
