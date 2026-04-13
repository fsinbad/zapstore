'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="rounded-xl">Try Again</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
