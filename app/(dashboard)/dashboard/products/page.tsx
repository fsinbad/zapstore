'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Plus, Package, CheckCircle2, FileText, MoreHorizontal, Pencil, Trash2, Eye, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { ROUTES } from '@/lib/constants/routes'
import { TableSkeleton } from '@/components/shared/LoadingSkeletons'
import { useProducts, useDeleteProduct, useUpdateProduct } from '@/lib/api/products'
import { toast } from 'sonner'
import type { ProductListItem } from '@/lib/api/products'

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const { data, isLoading } = useProducts({ mine: true })
  const products = data?.products ?? []
  const deleteProduct = useDeleteProduct()

  const filtered = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'published' && p.status === 'published') ||
      (activeTab === 'draft' && p.status === 'draft')
    return matchesSearch && matchesTab
  })

  const stats = {
    total: products.length,
    published: products.filter((p) => p.status === 'published').length,
    draft: products.filter((p) => p.status === 'draft').length,
  }

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId)
      toast.success('Product deleted successfully')
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16 lg:pb-0">
      <PageHeader
        title="Products"
        description="Manage your digital product listings."
        action={
          <Link href={ROUTES.DASHBOARD_PRODUCTS_NEW}>
            <Button className="gap-2 rounded-2xl h-11 px-6 shadow-xl shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        }
      />

      {/* Quick Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Drafts', value: stats.draft, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/30">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black tabular-nums">{stat.value.toString().padStart(2, '0')}</p>
              </div>
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-card/30 p-4 rounded-2xl border border-border/50">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/30 p-1.5 rounded-2xl gap-1">
            {[
              { id: 'all', label: 'All Products' },
              { id: 'published', label: 'Published' },
              { id: 'draft', label: 'Drafts' },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products..."
          className="w-full lg:w-80"
        />
      </div>

      {/* Products Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-2xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product: ProductListItem) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function ProductRow({ product, onDelete }: { product: ProductListItem; onDelete: (id: string) => void }) {
  const updateProduct = useUpdateProduct(product.slug)

  const handleToggle = async () => {
    const newStatus = product.status === 'published' ? 'draft' : 'published'
    try {
      await updateProduct.mutateAsync({ status: newStatus })
      toast.success(`Product ${newStatus === 'published' ? 'published' : 'unpublished'}`)
    } catch {
      toast.error('Failed to update product status')
    }
  }

  return (
    <TableRow className="hover:bg-muted/10">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-muted-foreground/30" />
          </div>
          <div>
            <p className="font-medium text-sm">{product.title}</p>
            <p className="text-xs text-muted-foreground">/{product.slug}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">{product.category}</Badge>
      </TableCell>
      <TableCell className="font-bold"><PriceDisplay amount={parseFloat(product.price)} suffixSize="xs" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch checked={product.status === 'published'} onCheckedChange={handleToggle} />
          <span className={cn("text-xs font-medium", product.status === 'published' ? "text-green-500" : "text-muted-foreground")}>
            {product.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">{product.salesCount}</TableCell>
      <TableCell className="text-right font-bold"><PriceDisplay amount={parseFloat(product.totalRevenueUsdc)} suffixSize="xs" /></TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={ROUTES.DASHBOARD_PRODUCT_EDIT(product.id)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.PRODUCT(product.slug)}>
                <Eye className="w-4 h-4 mr-2" /> View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(product.slug)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
