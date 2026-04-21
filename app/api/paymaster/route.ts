import { NextRequest, NextResponse } from 'next/server'

const AVNU_URL = process.env.NEXT_PUBLIC_AVNU_PAYMASTER_URL ?? 'https://sepolia.paymaster.avnu.fi'
const API_KEY = process.env.AVNU_PAYMASTER_API_KEY

/**
 * Server-side proxy for AVNU paymaster RPC calls.
 * Keeps the API key out of client bundles.
 */
export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Paymaster not configured' }, { status: 503 })
  }

  const body = await request.text()

  const upstream = await fetch(AVNU_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-paymaster-api-key': API_KEY,
    },
    body,
  })

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
