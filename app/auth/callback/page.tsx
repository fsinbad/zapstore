'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Zap, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthCallbackPage() {
  const { ready, authenticated } = usePrivy()

  useEffect(() => {
    // Wait for Privy to finish processing the OAuth code.
    // `ready` becomes true once Privy has either authenticated or rejected the session.
    if (!ready) return

    if (authenticated) {
      // Read caller-specified destination — set before login() was triggered.
      // Callers: usePurchaseFlow (→ product page), landing "Start Selling" (→ /dashboard).
      // Falls back to home so buyers are never stranded.
      const destination = sessionStorage.getItem('postLoginRedirect') || '/'
      sessionStorage.removeItem('postLoginRedirect')
      sessionStorage.removeItem('pendingPurchaseProductId') // cleaned up by usePurchaseFlow but belt-and-suspenders
      window.location.href = destination
    }
    // If not authenticated after ready, the UI below shows an error — no redirect needed.
  }, [ready, authenticated])

  // Privy is still processing the OAuth code
  if (!ready) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 font-heading font-bold text-2xl">
            <Zap className="h-7 w-7 text-primary" />
            <span className="text-primary">Zap</span>
            <span className="text-foreground">Store</span>
          </div>
          <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
          <p className="text-muted-foreground">Completing sign-in...</p>
        </div>
      </div>
    )
  }

  // Privy is ready but authentication failed (bad code, expired, etc.)
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm px-4">
          <div className="flex items-center justify-center gap-2 font-heading font-bold text-2xl">
            <Zap className="h-7 w-7 text-primary" />
            <span className="text-primary">Zap</span>
            <span className="text-foreground">Store</span>
          </div>
          <AlertCircle className="w-10 h-10 mx-auto text-destructive" />
          <div className="space-y-2">
            <p className="font-semibold">Sign-in failed</p>
            <p className="text-sm text-muted-foreground">
              The sign-in link may have expired or already been used. Please try again.
            </p>
          </div>
          <Button className="rounded-full px-8" onClick={() => { window.location.href = '/' }}>
            Back to ZapStore
          </Button>
        </div>
      </div>
    )
  }

  // Authenticated — redirect is in-flight, show the loading state
  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 font-heading font-bold text-2xl">
          <Zap className="h-7 w-7 text-primary" />
          <span className="text-primary">Zap</span>
          <span className="text-foreground">Store</span>
        </div>
        <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
        <p className="text-muted-foreground">Signed in — redirecting...</p>
      </div>
    </div>
  )
}
