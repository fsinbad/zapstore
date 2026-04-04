'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Upload, Image as ImageIcon, FileUp, Save, X } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { PRODUCT_CATEGORIES } from '@/lib/constants/categories'

export default function NewProductPage() {
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5 && tagInput.length <= 30) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16 lg:pb-0 max-w-4xl">
      {/* Back */}
      <Link href={ROUTES.DASHBOARD_PRODUCTS} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Create New Product</h1>
        <p className="text-muted-foreground mt-1">List a digital product for sale on ZapStore</p>
      </div>

      {/* Basic Info */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Basic information about your digital product.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Title</Label>
            <Input id="title" placeholder="e.g. Next.js SaaS Starter Kit" maxLength={120} className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
            <p className="text-xs text-muted-foreground">Max 120 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDesc" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Short Description</Label>
            <Input id="shortDesc" placeholder="Shown on product cards" maxLength={280} className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
            <p className="text-xs text-muted-foreground">Max 280 characters — shown on browse pages</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Description (Markdown)</Label>
            <Textarea
              id="description"
              placeholder="Describe your product in detail. Supports Markdown."
              className="min-h-[200px] rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
              <Select>
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-transparent">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (USDC)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                <Input id="price" type="number" step="0.01" min="0.99" max="999.99" placeholder="9.99" className="h-12 pl-8 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
              </div>
              <p className="text-xs text-muted-foreground">Min $0.99, max $999.99</p>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tags (max 5)</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #{tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                maxLength={30}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="h-10 rounded-xl bg-muted/20 border-transparent"
                disabled={tags.length >= 5}
              />
              <Button variant="outline" onClick={addTag} disabled={tags.length >= 5} className="rounded-xl">Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Files & Images</CardTitle>
          <CardDescription>Upload your product file and cover image.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cover Image (required)</Label>
            <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">Drop image here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WEBP &middot; Min 800x450 &middot; Max 5MB</p>
            </div>
          </div>

          {/* Product File */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product File (required)</Label>
            <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <FileUp className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">Drop file here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">Any file type &middot; Max 500MB</p>
            </div>
          </div>

          {/* Preview Images */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preview Images (optional, up to 3)</Label>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-24 h-16 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility & Publish */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Visibility</p>
              <p className="text-sm text-muted-foreground">
                {isPublished ? 'Product is visible on the marketplace' : 'Product is saved as a draft'}
              </p>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Link href={ROUTES.DASHBOARD_PRODUCTS}>
          <Button variant="outline" className="rounded-xl">Cancel</Button>
        </Link>
        <Button className="rounded-xl font-bold px-8 gap-2 shadow-lg shadow-primary/20">
          <Save className="w-4 h-4" />
          {isPublished ? 'Publish Product' : 'Save as Draft'}
        </Button>
      </div>
    </div>
  )
}
