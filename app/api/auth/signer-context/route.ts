import { NextRequest, NextResponse } from 'next/server'
import { privyClient, privyNodeClient } from '@/lib/privy'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/auth/signer-context
 *
 * Called by Starkzap's PrivySigner during onboard().
 * Verifies the Privy access token, finds (or creates) an app-managed
 * Starknet wallet for this user, stores the wallet ID in the DB, and returns:
 *   { walletId, publicKey }
 *
 * Wallets are created WITHOUT owner.user_id so the server can sign them
 * without requiring user authorization tokens.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
    }

    const accessToken = authHeader.replace('Bearer ', '')

    // Verify the Privy token → get userId
    const verifiedClaims = await privyClient.verifyAuthToken(accessToken)
    const privyUserId = verifiedClaims.userId

    // Look up the user record to find stored wallet ID
    const [userRow] = await db
      .select({ id: users.id, privyWalletId: users.privyWalletId })
      .from(users)
      .where(eq(users.privyUserId, privyUserId))
      .limit(1)

    if (!userRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let walletId = userRow.privyWalletId
    let publicKey: string | undefined

    if (walletId) {
      // Fetch the existing wallet to get its public key
      const wallet = await privyNodeClient.wallets().get(walletId)
      publicKey = (wallet as { public_key?: string }).public_key
    }

    if (!walletId || !publicKey) {
      // Create a new app-managed Starknet wallet (no owner.user_id so
      // the server can sign it without user authorization)
      const wallet = await privyNodeClient.wallets().create({
        chain_type: 'starknet',
      })

      walletId = wallet.id
      publicKey = (wallet as { public_key?: string }).public_key

      // Persist wallet ID to the user record
      await db
        .update(users)
        .set({ privyWalletId: walletId })
        .where(eq(users.id, userRow.id))
    }

    if (!publicKey) {
      return NextResponse.json(
        { error: 'Starknet wallet has no public key' },
        { status: 500 },
      )
    }

    return NextResponse.json({ walletId, publicKey })
  } catch (error) {
    console.error('Signer context error:', error)
    return NextResponse.json(
      { error: 'Failed to get signer context' },
      { status: 500 },
    )
  }
}
