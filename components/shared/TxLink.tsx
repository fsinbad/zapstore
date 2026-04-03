import { ExternalLink } from 'lucide-react'

interface TxLinkProps {
  hash: string
  className?: string
}

export function TxLink({ hash, className }: TxLinkProps) {
  const truncated = `${hash.slice(0, 6)}...${hash.slice(-4)}`
  const url = `https://starkscan.co/tx/${hash}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary transition-colors ${className ?? ''}`}
    >
      {truncated}
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}
