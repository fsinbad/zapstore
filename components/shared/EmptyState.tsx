'use client'

import React from 'react'
import { LucideIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  icon: LucideIcon
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-border/50 bg-muted/5 animate-in fade-in zoom-in-95 duration-500",
      className
    )}>
      <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-bold font-heading tracking-tight text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mt-2 mb-8 leading-relaxed">{description}</p>

      {actionLabel && (
        actionHref ? (
          <Button asChild className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Link href={actionHref}>
              <Plus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Link>
          </Button>
        ) : (
          <Button onClick={onAction} className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )
      )}
    </div>
  )
}
