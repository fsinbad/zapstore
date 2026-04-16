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
import { TableSkeleton } from '@/components/shared/LoadingSkeletons'
import { cn } from '@/lib/utils'
import { useSales, type SaleItem } from '@/lib/api/orders'

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilter, setProductFilter] = useState('all')

  const { data: salesData, isLoading } = useSales({
    product: productFilter !== 'all' ? productFilter : undefined,
  })

  const sales = salesData?.sales ?? []
  const total = salesData?.total ?? 0

  const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.amountUsdc), 0)
  const products = [...new Set(sales.map((s) => s.productTitle))]

  const filtered = sales.filter((s) => {
    const matchesSearch = s.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProduct = productFilter === 'all' || s.productTitle === productFilter
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
          { label: 'Total Sales', value: total.toString(), icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Avg. Sale', value: total > 0 ? `$${(totalRevenue / total).toFixed(2)}` : '$0.00', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
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
            {products.filter(Boolean).map((p) => (
              <SelectItem key={p} value={p!}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sales Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
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
              {filtered.map((sale: SaleItem) => (
                <TableRow key={sale.orderId} className="hover:bg-muted/10">
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {sale.completedAt ? new Date(sale.completedAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{sale.productTitle}</TableCell>
                  <TableCell className="font-bold"><PriceDisplay amount={parseFloat(sale.amountUsdc)} suffixSize="xs" /></TableCell>
                  <TableCell>{sale.buyerAddress ? <AddressDisplay address={sale.buyerAddress} /> : '-'}</TableCell>
                  <TableCell>{sale.starknetTxHash ? <TxLink hash={sale.starknetTxHash} /> : '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/5">completed</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
