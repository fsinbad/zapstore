interface PriceDisplayProps {
  amount: number
  className?: string
}

export function PriceDisplay({ amount, className }: PriceDisplayProps) {
  return (
    <span className={className}>
      ${amount.toFixed(2)} <span className="text-muted-foreground text-sm">USDC</span>
    </span>
  )
}
