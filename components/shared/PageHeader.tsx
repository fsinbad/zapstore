import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-8 group">
      <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-500">
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground font-medium max-w-lg">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
          {action}
        </div>
      )}
    </div>
  )
}
