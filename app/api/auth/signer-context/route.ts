import { NextRequest, NextResponse } from 'next/server'
import { privyClient, privyNodeClient } from '@/lib/privy'

/**
 * POST /api/auth/signer-context
 *
 * Called by Starkzap's PrivySigner during onboard().
 * Verifies the Privy access token, finds (or creates) the user's
 * Starknet wallet via @privy-io/node, and returns:
 *   { walletId, publicKey }
 *
 * The caller (useWallet.ts) attaches a rawSign function that calls
 * /api/auth/sign with proper auth — no serverUrl needed here.
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
    const userId = verifiedClaims.userId

    // Look for an existing Starknet wallet for this user
    let starknetWallet: { id: string; public_key?: string; address: string } | null = null

    for await (const wallet of privyNodeClient.wallets().list({
      chain_type: 'starknet',
      user_id: userId,
    })) {
      starknetWallet = wallet
      break
    }

    // If none found, create one now
    if (!starknetWallet) {
      starknetWallet = await privyNodeClient.wallets().create({
        chain_type: 'starknet',
        owner: { user_id: userId },
      })
    }

    if (!starknetWallet.public_key) {
      return NextResponse.json(
        { error: 'Starknet wallet has no public key' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      walletId: starknetWallet.id,
      publicKey: starknetWallet.public_key,
    })
  } catch (error) {
    console.error('Signer context error:', error)
    return NextResponse.json(
      { error: 'Failed to get signer context' },
      { status: 500 },
    )
  }
}
