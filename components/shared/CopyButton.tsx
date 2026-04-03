'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CopyButtonProps {
  text: string
  label?: string
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleCopy} className="gap-2">
      {copied ? (
        <><Check className="w-4 h-4" /> Copied</>
      ) : (
        <><Copy className="w-4 h-4" /> {label}</>
      )}
    </Button>
  )
}
