export type ProductCategory =
  | 'Templates'
  | 'Code'
  | 'Design'
  | 'Writing'
  | 'Video'
  | 'Music'
  | 'Other'

export type ProductStatus = 'draft' | 'published' | 'deleted'

export interface Creator {
  username: string
  displayName: string
  avatar: string
  bio?: string
  productCount?: number
  memberSince?: string
}

export interface ProductCardData {
  id: string
  slug: string
  title: string
  shortDescription: string
  price: number
  category: ProductCategory
  creator: Pick<Creator, 'username' | 'avatar'>
}

export interface Product extends ProductCardData {
  descriptionMd: string
  coverImageUrl: string | null
  previewImageUrls: string[]
  fileName: string
  fileSize: string
  fileMimeType: string
  tags: string[]
  status: ProductStatus
  salesCount: number
  totalRevenueUsdc: number
  createdAt: string
  updatedAt: string
  creator: Creator
}

export interface DashboardProduct {
  id: string
  title: string
  slug: string
  price: number
  status: ProductStatus
  category: ProductCategory
  salesCount: number
  revenue: number
}
