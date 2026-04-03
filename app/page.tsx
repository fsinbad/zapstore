import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Store, ShieldCheck, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen grid-pattern">
      {/* Navbar placeholder */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold">ZapStore</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button>Start Selling</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-6">
          Powered by Starknet
        </Badge>
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="gradient-text">Sell your work.</span>
          <br />
          <span className="gradient-text">Keep 100%.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Digital products. Instant delivery. Gasless payments in USDC.
          No wallet required. Powered by Starknet.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" className="gap-2">
            Start Selling <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            Browse Products
          </Button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass-card">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Gasless Checkout</CardTitle>
              <CardDescription>
                Buyers pay zero gas. Sign in with Google, pay in USDC, download instantly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Store className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle>0% Platform Fee</CardTitle>
              <CardDescription>
                No middleman. No commission. Revenue goes directly to your wallet.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-zap-cyan/10">
                <ShieldCheck className="h-5 w-5 text-zap-cyan" />
              </div>
              <CardTitle>Self-Custodied Revenue</CardTitle>
              <CardDescription>
                Your keys, your funds. Withdraw anytime to any Starknet address.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  )
}
