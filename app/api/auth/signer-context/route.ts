import { NextRequest, NextResponse } from 'next/server'
import { privyClient } from '@/lib/privy'

/**
 * POST /api/auth/signer-context
 *
 * Called by the Starkzap PrivySigner during onboard().
 * Verifies the Privy access token, looks up (or creates) the user's
 * Starknet embedded wallet, and returns the signer context that
 * Starkzap needs: { walletId, publicKey, serverUrl }.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
    }

    const accessToken = authHeader.replace('Bearer ', '')

    // Verify the Privy token and get user
    const verifiedClaims = await privyClient.verifyAuthToken(accessToken)
    const userId = verifiedClaims.userId

    // Get user's wallets from Privy
    const user = await privyClient.getUser(userId)

    // Find or identify the Starknet-compatible wallet
    // Privy embedded wallets are EVM-based, but Starkzap's PrivySigner
    // uses Privy's rawSign endpoint to sign Starknet transactions.
    // We look for the embedded wallet.
    const embeddedWallet = user.linkedAccounts.find(
      (account) => account.type === 'wallet' && account.walletClientType === 'privy'
    )

    if (!embeddedWallet || !('address' in embeddedWallet)) {
      return NextResponse.json(
        { error: 'No embedded wallet found. Please try logging in again.' },
        { status: 404 }
      )
    }

    // Build the sign endpoint URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const serverUrl = `${appUrl}/api/auth/sign`

    return NextResponse.json({
      walletId: embeddedWallet.address, // Privy wallet identifier
      publicKey: embeddedWallet.address, // Will be derived by Starkzap
      serverUrl,
    })
  } catch (error) {
    console.error('Signer context error:', error)
    return NextResponse.json(
      { error: 'Failed to get signer context' },
      { status: 500 }
    )
  }
}
