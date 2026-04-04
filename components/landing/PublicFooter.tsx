'use client'

import Link from 'next/link'
import { Globe, Code2, Zap } from 'lucide-react'

const footerLinks = {
  marketplace: [
    { label: 'Browse Products', href: '/products' },
    { label: 'Search', href: '/search' },
    { label: 'Categories', href: '/products?category=all' },
  ],
  creators: [
    { label: 'Start Selling', href: '/dashboard/products/new' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Creator Guide', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Starkzap SDK', href: '#' },
    { label: 'Support', href: '#' },
  ],
}

export default function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border/40 pt-20 pb-10 overflow-hidden bg-background">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/5 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center group">
              <div className="flex items-center gap-2 font-heading font-bold text-2xl tracking-tight">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-primary">Zap</span>
                <span className="text-foreground">Store</span>
              </div>
            </Link>
            <p className="max-w-xs text-muted-foreground leading-relaxed text-sm">
              Gasless digital product marketplace on Starknet. Sell anything digital, accept USDC, keep 100% of your revenue.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300">
                <Code2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-6">Marketplace</h4>
            <ul className="space-y-4">
              {footerLinks.marketplace.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-6">Creators</h4>
            <ul className="space-y-4">
              {footerLinks.creators.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-6">Resources</h4>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground text-xs tabular-nums">
            &copy; {currentYear} ZapStore. Powered by Starknet.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs">Privacy</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
