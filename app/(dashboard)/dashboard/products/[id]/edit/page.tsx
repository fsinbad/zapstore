'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Image as ImageIcon, FileUp, Upload } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { PRODUCT_CATEGORIES } from '@/lib/constants/categories'

export default function EditProductPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16 lg:pb-0 max-w-4xl">
      <Link href={ROUTES.DASHBOARD_PRODUCTS} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground mt-1">Update your digital product listing</p>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Update product information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Title</Label>
            <Input defaultValue="Next.js SaaS Starter Kit" maxLength={120} className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Short Description</Label>
            <Input defaultValue="Production-ready SaaS template with auth, billing, and dashboard" maxLength={280} className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Description (Markdown)</Label>
            <Textarea
              defaultValue="## What's included&#10;&#10;- Authentication — Email/password, OAuth&#10;- Billing — Stripe integration&#10;- Dashboard — Admin panel"
              className="min-h-[200px] rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all resize-y"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
              <Select defaultValue="templates">
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (USDC)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                <Input type="number" step="0.01" defaultValue="49.00" className="h-12 pl-8 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tags</Label>
            <div className="flex gap-2 flex-wrap">
              {['nextjs', 'saas', 'typescript', 'tailwind'].map((tag) => (
                <Badge key={tag} variant="secondary">#{tag}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Files & Images</CardTitle>
          <CardDescription>Replace existing files or upload new ones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cover Image</Label>
            <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">Click to replace cover image</p>
              <p className="text-xs text-muted-foreground mt-1">Current: cover-image.png</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product File</Label>
            <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <FileUp className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">Click to replace product file</p>
              <p className="text-xs text-muted-foreground mt-1">Current: nextjs-saas-starter-v2.zip (12.4 MB)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Visibility</p>
              <p className="text-sm text-muted-foreground">Product is currently published</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Link href={ROUTES.DASHBOARD_PRODUCTS}><Button variant="outline" className="rounded-xl">Cancel</Button></Link>
        <Button className="rounded-xl font-bold px-8 gap-2 shadow-lg shadow-primary/20">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>
    </div>
  )
}
