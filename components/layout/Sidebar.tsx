'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Store
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCurrentUser } from '@/lib/api/users'
import { useWallet } from '@/hooks/useWallet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navSections = [
  {
    title: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
      { icon: Package, label: 'Products', href: '/dashboard/products' },
    ]
  },
  {
    title: 'Revenue',
    items: [
      { icon: BarChart3, label: 'Sales', href: '/dashboard/sales' },
      { icon: Wallet, label: 'Payouts', href: '/dashboard/payouts' },
    ]
  },
  {
    title: 'Settings',
    items: [
      { icon: Settings, label: 'Store Settings', href: '/dashboard/settings' },
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebarCollapse } = useUiStore()
  const { data: userData } = useCurrentUser()
  const { logout } = useWallet()

  const user = userData?.user
  const displayName = user?.displayName ?? user?.username ?? 'Creator'
  const email = user?.email ?? ''
  const initials = displayName.slice(0, 2).toUpperCase()
  const avatarUrl = user?.avatarUrl ?? null
  const storeUsername = user?.username ?? 'me'

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-xl tracking-tight animate-in fade-in slide-in-from-left-2">
                ZapStore
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex w-8 h-8 rounded-full p-0"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!sidebarCollapsed && (
                <h3 className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 animate-in fade-in">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  const Icon = item.icon

                  const link = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative",
                        isActive
                          ? "text-foreground bg-primary/5 font-medium border-l-2 border-primary -ml-[2px] rounded-l-none"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "group-hover:text-foreground")} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  )

                  if (sidebarCollapsed) {
                    return (
                      <Tooltip key={item.label}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    )
                  }

                  return <React.Fragment key={item.label}>{link}</React.Fragment>
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-4">
          {/* View Store */}
          <Link href={`/store/${storeUsername}`} className={cn("flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors", sidebarCollapsed && "justify-center")}>
            <Store className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>View My Store</span>}
          </Link>

          <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
            <Avatar className="w-8 h-8 flex-shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">{displayName}</span>
                {email && <span className="text-xs text-muted-foreground truncate">{email}</span>}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              sidebarCollapsed && "px-0 justify-center"
            )}
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
