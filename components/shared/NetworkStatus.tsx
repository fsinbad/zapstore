'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { WifiOff } from 'lucide-react'

export function NetworkStatus() {
  const offlineToastId = useRef<string | number | null>(null)

  useEffect(() => {
    function handleOffline() {
      offlineToastId.current = toast.error('No internet connection', {
        description: 'Check your network. ZapStore will reconnect automatically.',
        duration: Infinity,
        icon: <WifiOff className="w-4 h-4" />,
        id: 'network-offline',
      })
    }

    function handleOnline() {
      toast.dismiss('network-offline')
      offlineToastId.current = null
      toast.success('Back online', {
        description: 'Your connection has been restored.',
        duration: 3000,
        id: 'network-online',
      })
    }

    // Fire immediately if already offline when component mounts
    if (!navigator.onLine) {
      handleOffline()
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return null
}
