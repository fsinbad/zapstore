import { NextRequest, NextResponse } from 'next/server'
import { privyClient } from '@/lib/privy'

/**
 * POST /api/auth/sign
 *
 * Relay endpoint for Starkzap's PrivySigner.
 * Receives { walletId, hash } from the PrivySigner,
 * calls Privy's rawSign API with the app secret,
 * and returns { signature }.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletId, hash } = body

    if (!walletId || !hash) {
      return NextResponse.json(
        { error: 'Missing walletId or hash' },
        { status: 400 }
      )
    }

    // Use Privy server SDK to sign the hash
    // This is the rawSign endpoint that Starkzap's PrivySigner calls
    const response = await (privyClient as any).walletApi.rpc({
      walletId,
      method: 'personal_sign',
      params: { message: hash },
    })

    return NextResponse.json({
      signature: response.data?.signature || response.signature,
    })
  } catch (error) {
    console.error('Sign relay error:', error)
    return NextResponse.json(
      { error: 'Signing failed' },
      { status: 500 }
    )
  }
}
