'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Wallet,
  BarChart3,
  ExternalLink,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { TxLink } from '@/components/shared/TxLink'
import { AddressDisplay } from '@/components/shared/AddressDisplay'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { ROUTES } from '@/lib/constants/routes'
import { MOCK_SALES } from '@/lib/mock-data'

const stats = [
  { label: 'Total Revenue', value: '$2,450.00 USDC', change: '+12.4%', trend: 'up' as const, icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { label: 'This Week', value: '$340.00 USDC', change: '+8 sales', trend: 'up' as const, icon: TrendingUp, color: 'text-primary', bgColor: 'bg-primary/10' },
  { label: 'Active Products', value: '12', change: '3 drafts', trend: 'up' as const, icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { label: 'Wallet Balance', value: '$1,890.00', change: 'Live', trend: 'up' as const, icon: Wallet, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
]

const recentSales = MOCK_SALES.slice(0, 5)

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16 lg:pb-0">
      <PageHeader
        title="Good morning, Creator"
        description="Here's what's happening with your store today."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={ROUTES.DASHBOARD_PRODUCTS_NEW}>
              <Button variant="outline" size="sm" className="rounded-full">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </Link>
            <Link href={ROUTES.DASHBOARD_PAYOUTS}>
              <Button size="sm" className="rounded-full">
                <Wallet className="w-4 h-4 mr-2" /> Withdraw
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
              <CardTitle className="text-[10px] font-bold">{stat.label}</CardTitle>
              <div className={cn("p-2 rounded-xl", stat.bgColor)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading tabular-nums">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-destructive" />
                )}
                <span className={cn("text-xs font-medium", stat.trend === 'up' ? "text-green-500" : "text-destructive")}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sales */}
        <Card className="lg:col-span-2 border-border/50 bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold font-heading">Recent Sales</CardTitle>
            <Link href={ROUTES.DASHBOARD_SALES} className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ExternalLink className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {recentSales.map((sale, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sale.product}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <AddressDisplay address={sale.buyer} />
                      <span className="text-xs text-muted-foreground">&middot;</span>
                      <span className="text-xs text-muted-foreground">{sale.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm"><PriceDisplay amount={sale.amount} suffixSize="xs" /></p>
                    <TxLink hash={sale.txHash} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 bg-card overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-heading">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={ROUTES.DASHBOARD_PRODUCTS_NEW} className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                <Plus className="w-5 h-5 text-primary" />
                Add New Product
              </Button>
            </Link>
            <Link href={ROUTES.STORE('creator')} className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                <ExternalLink className="w-5 h-5 text-primary" />
                View My Store
              </Button>
            </Link>
            <Link href={ROUTES.DASHBOARD_PAYOUTS} className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                <Wallet className="w-5 h-5 text-primary" />
                Withdraw USDC
              </Button>
            </Link>

            <div className="pt-4 space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Stats</h4>
              {[
                { label: 'Weekly Sales', value: '23', icon: BarChart3 },
                { label: 'Conversion Rate', value: '5.2%', icon: TrendingUp },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
