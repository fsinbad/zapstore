'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { Zap } from 'lucide-react'

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { sidebarCollapsed } = useUiStore()
  const { ready, authenticated } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace('/')
    }
  }, [ready, authenticated, router])

  // Show nothing while Privy is loading or redirecting
  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out z-30",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  )
}
