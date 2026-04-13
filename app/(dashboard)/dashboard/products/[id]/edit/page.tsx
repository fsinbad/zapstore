'use client'

import { useState, useRef, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Image as ImageIcon, FileUp, Upload, Loader2, X } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { PRODUCT_CATEGORIES } from '@/lib/constants/categories'
import { useProduct, useUpdateProduct, useUploadImage, useUploadFile } from '@/lib/api/products'
import { TableSkeleton } from '@/components/shared/LoadingSkeletons'
import { toast } from 'sonner'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const { data, isLoading } = useProduct(id)
  const product = data?.product ?? null

  const slug = product?.slug ?? id
  const updateProduct = useUpdateProduct(slug)
  const uploadImage = useUploadImage()
  const uploadFile = useUploadFile()

  const [title, setTitle] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [coverImage, setCoverImage] = useState<{ url: string; cid: string } | null>(null)
  const [productFile, setProductFile] = useState<{ path: string; fileName: string; fileSize: number; fileMimeType: string } | null>(null)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product) {
      setTitle(product.title ?? '')
      setShortDesc(product.shortDescription ?? '')
      setDescription(product.descriptionMd ?? '')
      setCategory(product.category ?? '')
      setPrice(product.price?.toString() ?? '')
      setTags(product.tags ?? [])
      if (product.coverImageUrl) {
        setCoverImage({ url: product.coverImageUrl, cid: '' })
      }
      if (product.fileName) {
        setProductFile({ path: '', fileName: product.fileName, fileSize: product.fileSizeBytes ?? 0, fileMimeType: product.fileMimeType ?? '' })
      }
    }
  }, [product])

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5 && tagInput.length <= 30) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await uploadImage.mutateAsync(file)
      setCoverImage(result)
      toast.success('Cover image updated')
    } catch {
      toast.error('Failed to upload cover image')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await uploadFile.mutateAsync(file)
      setProductFile(result)
      toast.success('Product file updated')
    } catch {
      toast.error('Failed to upload product file')
    }
  }

  const handleSubmit = async () => {
    try {
      await updateProduct.mutateAsync({
        title,
        shortDescription: shortDesc,
        descriptionMd: description,
        category,
        priceUsdc: price,
        tags,
        status: isPublished ? 'published' : 'draft',
        ...(coverImage?.url && { coverImageUrl: coverImage.url }),
        ...(productFile?.path && {
          filePath: productFile.path,
          fileName: productFile.fileName,
          fileSizeBytes: productFile.fileSize,
          fileMimeType: productFile.fileMimeType,
        }),
      })
      toast.success('Product updated!')
      router.push(ROUTES.DASHBOARD_PRODUCTS)
    } catch {
      toast.error('Failed to update product')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-16 lg:pb-0 max-w-4xl">
        <TableSkeleton />
      </div>
    )
  }

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
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Short Description</Label>
            <Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} maxLength={280} className="h-12 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Description (Markdown)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[200px] rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all resize-y"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={setCategory}>
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
                <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="h-12 pl-8 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tags</Label>
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

      {/* Files */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Files & Images</CardTitle>
          <CardDescription>Replace existing files or upload new ones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cover Image</Label>
            <input type="file" ref={coverInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} />
            <div
              className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => coverInputRef.current?.click()}
            >
              {uploadImage.isPending ? (
                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-3" />
              ) : coverImage?.url ? (
                <img src={coverImage.url} alt="Cover preview" className="w-full max-h-48 object-cover rounded-xl mb-3" />
              ) : (
                <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              )}
              <p className="text-sm font-medium">Click to replace cover image</p>
              <p className="text-xs text-muted-foreground mt-1">{coverImage?.url ? 'Current image shown above' : 'No cover image'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product File</Label>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <div
              className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadFile.isPending ? (
                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-3" />
              ) : (
                <FileUp className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              )}
              <p className="text-sm font-medium">Click to replace product file</p>
              <p className="text-xs text-muted-foreground mt-1">
                {productFile ? `Current: ${productFile.fileName} (${(productFile.fileSize / 1024 / 1024).toFixed(1)} MB)` : 'No file uploaded'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Visibility</p>
              <p className="text-sm text-muted-foreground">
                {isPublished ? 'Product is currently published' : 'Product is saved as a draft'}
              </p>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Link href={ROUTES.DASHBOARD_PRODUCTS}><Button variant="outline" className="rounded-xl">Cancel</Button></Link>
        <Button
          className="rounded-xl font-bold px-8 gap-2 shadow-lg shadow-primary/20"
          onClick={handleSubmit}
          disabled={updateProduct.isPending}
        >
          {updateProduct.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
