'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, BarChart3, DollarSign, TrendingUp } from 'lucide-react'
import { TxLink } from '@/components/shared/TxLink'
import { AddressDisplay } from '@/components/shared/AddressDisplay'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { cn } from '@/lib/utils'
import { MOCK_SALES } from '@/lib/mock-data'
import type { Sale } from '@/types'

const totalRevenue = MOCK_SALES.reduce((sum, s) => sum + s.amount, 0)

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilter, setProductFilter] = useState('all')

  const products = [...new Set(MOCK_SALES.map(s => s.product))]

  const filtered = MOCK_SALES.filter((s: Sale) => {
    const matchesSearch = s.product.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProduct = productFilter === 'all' || s.product === productFilter
    return matchesSearch && matchesProduct
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16 lg:pb-0">
      <PageHeader
        title="Sales History"
        description="Track all your product sales and revenue."
        action={
          <Button variant="outline" className="gap-2 rounded-xl">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Total Sales', value: MOCK_SALES.length.toString(), icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Avg. Sale', value: `$${(totalRevenue / MOCK_SALES.length).toFixed(2)}`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/30">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black tabular-nums">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search sales..." className="flex-1" />
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sales Table */}
      <div className="rounded-2xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((sale: Sale) => (
              <TableRow key={sale.id} className="hover:bg-muted/10">
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{sale.date}</TableCell>
                <TableCell className="font-medium text-sm">{sale.product}</TableCell>
                <TableCell className="font-bold"><PriceDisplay amount={sale.amount} suffixSize="xs" /></TableCell>
                <TableCell><AddressDisplay address={sale.buyer} /></TableCell>
                <TableCell><TxLink hash={sale.txHash} /></TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/5">{sale.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
