'use client'

import { useEffect } from 'react'
import { PrivyProvider as BasePrivyProvider, usePrivy } from '@privy-io/react-auth'
import { setAccessTokenProvider } from '@/lib/api/client'

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!

/** Bridges Privy's getAccessToken into our API client */
function AccessTokenBridge({ children }: { children: React.ReactNode }) {
  const { getAccessToken } = usePrivy()

  useEffect(() => {
    setAccessTokenProvider(getAccessToken)
  }, [getAccessToken])

  return <>{children}</>
}

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#5C5CFF',
        },
        loginMethods: ['google', 'email'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'all-users',
          },
        },
      }}
    >
      <AccessTokenBridge>
        {children}
      </AccessTokenBridge>
    </BasePrivyProvider>
  )
}
