'use client'

import { useEffect } from 'react'
import { Loader2, Zap } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

export default function AuthLogoutPage() {
  useEffect(() => {
    // In production: clear Privy session, disconnect wallet, clear Zustand stores
    // Then redirect to homepage
    const timer = setTimeout(() => {
      window.location.href = ROUTES.HOME
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 font-heading font-bold text-2xl">
          <Zap className="h-7 w-7 text-primary" />
          <span className="text-primary">Zap</span>
          <span className="text-foreground">Store</span>
        </div>
        <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  )
}
