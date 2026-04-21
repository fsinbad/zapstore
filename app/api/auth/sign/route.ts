import { NextRequest, NextResponse } from 'next/server'
import { privyClient, privyNodeClient } from '@/lib/privy'

/**
 * POST /api/auth/sign
 *
 * Signing relay for Starkzap's PrivySigner rawSign function.
 * Requires a valid Privy Bearer token (verified before signing).
 *
 * Body: { walletId: string, hash: string }
 * Response: { signature: string }  — hex-encoded Stark signature
 *
 * Wallets are app-managed (created without owner.user_id) so the server
 * can sign without requiring user authorization tokens.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the caller is authenticated
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
    }
    const accessToken = authHeader.replace('Bearer ', '')
    await privyClient.verifyAuthToken(accessToken)

    const body = await request.json()
    const { walletId, hash } = body

    if (!walletId || !hash) {
      return NextResponse.json({ error: 'Missing walletId or hash' }, { status: 400 })
    }

    // Sign the hash using Privy's rawSign — Starknet curve signing.
    // No authorization_context needed: wallets are app-managed so the
    // server's app credentials are sufficient to authorize signing.
    const result = await privyNodeClient.wallets().rawSign(walletId, {
      params: { hash },
    })

    return NextResponse.json({ signature: result.signature })
  } catch (error) {
    console.error('Sign relay error:', error)
    return NextResponse.json({ error: 'Signing failed' }, { status: 500 })
  }
}
