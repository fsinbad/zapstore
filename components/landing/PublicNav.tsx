'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Menu, X, Zap, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { usePrivy } from '@privy-io/react-auth'
import { ROUTES } from '@/lib/constants/routes'

const navLinks = [
  { href: '/products', label: 'Browse' },
  { href: '/search', label: 'Search' },
]

export default function PublicNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { ready, authenticated, login } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
  }, [isOpen])

  const handleStartSelling = () => {
    setIsOpen(false)
    if (authenticated) {
      router.push(ROUTES.DASHBOARD_PRODUCTS_NEW)
    } else {
      login()
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center pointer-events-none">
      <nav className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pointer-events-auto">
        <div className="flex h-14 items-center justify-between bg-background/60 backdrop-blur-xl border border-border/40 rounded-full px-4 sm:px-8 shadow-2xl">
          {/* Logo */}
          <Link href="/" className="flex items-center group transition-transform duration-150 hover:scale-[1.02]">
            <div className="flex items-center gap-2 font-heading font-bold text-lg tracking-tight">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-primary">Zap</span>
              <span className="text-foreground">Store</span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right CTAs (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {ready && authenticated ? (
              <Link href={ROUTES.DASHBOARD}>
                <Button variant="ghost" className="text-muted-foreground py-4 rounded-xl gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                className="text-muted-foreground py-4 rounded-xl"
                onClick={() => login()}
                disabled={!ready}
              >
                Sign In
              </Button>
            )}
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl glow-blue gap-2"
              onClick={handleStartSelling}
              disabled={!ready}
            >
              Start Selling <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors relative z-[60]"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="lg:hidden absolute top-20 left-4 right-4 bg-card border border-border/40 rounded-3xl overflow-hidden shadow-2xl z-50 p-6 flex flex-col gap-4"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border/50 my-2" />
              <div className="flex flex-col gap-3">
                {ready && authenticated ? (
                  <Link href={ROUTES.DASHBOARD} className="w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full text-muted-foreground py-6 rounded-xl gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground py-6 rounded-xl"
                    onClick={() => { setIsOpen(false); login() }}
                    disabled={!ready}
                  >
                    Sign In
                  </Button>
                )}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl glow-blue"
                  onClick={handleStartSelling}
                  disabled={!ready}
                >
                  Start Selling
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
