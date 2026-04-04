'use client'

import React from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { sidebarCollapsed } = useUiStore()

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
