'use client'

import React from 'react'
import { Bell, Search, Plus, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useCurrentUser } from '@/lib/api/users'
import { useWallet } from '@/hooks/useWallet'

export default function TopBar() {
  const pathname = usePathname()
  const { data: userData } = useCurrentUser()
  const { logout } = useWallet()

  const user = userData?.user
  const displayName = user?.displayName ?? user?.username ?? 'Creator'
  const email = user?.email ?? ''
  const initials = displayName.slice(0, 2).toUpperCase()
  const avatarUrl = user?.avatarUrl ?? null

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview'
    if (pathname.includes('/products/new')) return 'New Product'
    if (pathname.includes('/products') && pathname.includes('/edit')) return 'Edit Product'
    if (pathname.includes('/products')) return 'Products'
    if (pathname.includes('/sales')) return 'Sales'
    if (pathname.includes('/payouts')) return 'Payouts'
    if (pathname.includes('/settings')) return 'Settings'
    return 'Dashboard'
  }

  return (
    <header className="h-14 lg:h-16 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold font-heading hidden md:block">{getPageTitle()}</h2>
      </div>

      {/* Search (Desktop) */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="Search products, sales..."
            className="pl-10 h-10 bg-muted/50 border-transparent focus:bg-background transition-all"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />

        <Link href="/dashboard/products/new" className="hidden sm:block">
          <Button size="sm" className="gap-2 rounded-full h-9 px-4">
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Product</span>
          </Button>
        </Link>

        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 md:w-auto md:gap-3 rounded-full md:rounded-xl p-0 md:px-2 md:py-1.5 overflow-hidden border border-transparent hover:border-border transition-all">
              <Avatar className="h-8 w-8">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start min-w-0 pr-1">
                <span className="text-sm font-semibold truncate leading-none mb-1">{displayName}</span>
                <span className="text-[10px] text-muted-foreground leading-none">Creator</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{displayName}</span>
                {email && <span className="text-xs text-muted-foreground font-normal">{email}</span>}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Store Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
