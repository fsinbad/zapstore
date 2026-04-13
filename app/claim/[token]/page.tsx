'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, CheckCircle2, XCircle, Loader2, ShoppingBag, Zap } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { ClaimState } from '@/types'

interface ClaimData {
  downloadUrl: string
  fileName: string
}

export default function ClaimPage() {
  const { token } = useParams<{ token: string }>()
  const [state, setState] = useState<ClaimState>('validating')
  const [claimData, setClaimData] = useState<ClaimData | null>(null)

  useEffect(() => {
    if (!token) {
      setState('invalid')
      return
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/claim/${token}`, {
          redirect: 'manual',
        })

        if (res.type === 'opaqueredirect' || res.status === 302) {
          // The API returned a redirect — extract the location or follow it
          const location = res.headers.get('Location')
          if (location) {
            setClaimData({ downloadUrl: location, fileName: 'download' })
            setState('ready')
          } else {
            // Fallback: use the claim URL directly as the download
            setClaimData({ downloadUrl: `/api/claim/${token}`, fileName: 'download' })
            setState('ready')
          }
          return
        }

        if (res.ok) {
          const data = await res.json()
          if (data.downloadUrl) {
            setClaimData({ downloadUrl: data.downloadUrl, fileName: data.fileName ?? 'download' })
            setState('ready')
          } else if (data.error) {
            if (data.error === 'used' || data.code === 'TOKEN_USED') {
              setState('used')
            } else if (data.error === 'expired' || data.code === 'TOKEN_EXPIRED') {
              setState('expired')
            } else {
              setState('invalid')
            }
          } else {
            // Assume the response itself is the claim data
            setClaimData({ downloadUrl: `/api/claim/${token}`, fileName: data.fileName ?? 'download' })
            setState('ready')
          }
          return
        }

        // Error responses
        if (res.status === 410) {
          setState('used')
        } else if (res.status === 404) {
          setState('invalid')
        } else if (res.status === 403) {
          setState('expired')
        } else {
          setState('invalid')
        }
      } catch (err) {
        console.error('Claim validation failed:', err)
        setState('invalid')
      }
    }

    validateToken()
  }, [token])

  const handleDownload = () => {
    if (claimData?.downloadUrl) {
      window.open(claimData.downloadUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 font-heading font-bold text-xl">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-primary">Zap</span>
            <span className="text-foreground">Store</span>
          </div>
        </div>

        <Card className="border-border/50 bg-card">
          <CardContent className="p-8 text-center">
            {state === 'validating' && (
              <div className="space-y-4 py-8">
                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
                <h2 className="font-heading font-bold">Validating download link...</h2>
                <p className="text-sm text-muted-foreground">Please wait while we verify your purchase</p>
              </div>
            )}

            {state === 'ready' && (
              <div className="space-y-6 py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg">Your download is ready</h2>
                  <p className="text-sm text-muted-foreground mt-1">{claimData?.fileName ?? 'download'}</p>
                </div>
                <Button onClick={handleDownload} size="lg" className="w-full h-14 text-base font-bold rounded-xl gap-2">
                  <Download className="w-5 h-5" /> Download File
                </Button>
                <p className="text-xs text-muted-foreground">This link can only be used once</p>
              </div>
            )}

            {state === 'used' && (
              <div className="space-y-6 py-4">
                <XCircle className="w-12 h-12 mx-auto text-amber-500" />
                <div>
                  <h2 className="font-heading font-bold text-lg">This link has been used</h2>
                  <p className="text-sm text-muted-foreground mt-1">Each download link can only be used once.</p>
                </div>
                <Link href={ROUTES.MY_PURCHASES}>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <ShoppingBag className="w-4 h-4" /> Go to My Purchases
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">You can request a new download link from your purchases page</p>
              </div>
            )}

            {state === 'expired' && (
              <div className="space-y-6 py-4">
                <XCircle className="w-12 h-12 mx-auto text-destructive" />
                <div>
                  <h2 className="font-heading font-bold text-lg">Download link expired</h2>
                  <p className="text-sm text-muted-foreground mt-1">Download links expire after 72 hours.</p>
                </div>
                <Link href={ROUTES.MY_PURCHASES}>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <ShoppingBag className="w-4 h-4" /> Request new link
                  </Button>
                </Link>
              </div>
            )}

            {state === 'invalid' && (
              <div className="space-y-6 py-4">
                <XCircle className="w-12 h-12 mx-auto text-destructive" />
                <div>
                  <h2 className="font-heading font-bold text-lg">Invalid download link</h2>
                  <p className="text-sm text-muted-foreground mt-1">This link is not valid. Please check your email for the correct link.</p>
                </div>
                <Link href={ROUTES.HOME}>
                  <Button variant="outline" className="rounded-xl">Go to ZapStore</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
