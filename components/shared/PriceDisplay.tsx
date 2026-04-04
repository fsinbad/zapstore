import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  amount: number
  className?: string
  /** Size of the USDC suffix — defaults to "sm" */
  suffixSize?: 'xs' | 'sm' | 'base'
}

export function PriceDisplay({ amount, className, suffixSize = 'sm' }: PriceDisplayProps) {
  return (
    <span className={cn('tabular-nums', className)}>
      ${amount.toFixed(2)}{' '}
      <span className={cn('text-muted-foreground font-normal', {
        'text-xs': suffixSize === 'xs',
        'text-sm': suffixSize === 'sm',
        'text-base': suffixSize === 'base',
      })}>
        USDC
      </span>
    </span>
  )
}
