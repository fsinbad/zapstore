import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

// ─── Types (API response shapes) ─────────────────────────

interface ProductListItem {
  id: string
  slug: string
  title: string
  shortDescription: string | null
  price: string
  category: string | null
  coverImageUrl: string
  salesCount: number
  status: string
  totalRevenueUsdc: string
  createdAt: string
  creator: {
    username: string | null
    displayName: string | null
    avatarUrl: string | null
  }
}

interface ProductDetail extends ProductListItem {
  descriptionMd: string | null
  previewImageUrls: string[] | null
  fileName: string
  fileSizeBytes: number | null
  fileMimeType: string | null
  tags: string[] | null
  totalRevenueUsdc: string
  creator: {
    username: string | null
    displayName: string | null
    avatarUrl: string | null
    bio: string | null
    productCount?: number
  }
}

interface ProductListResponse {
  products: ProductListItem[]
  total: number
  limit: number
  offset: number
}

interface CreateProductInput {
  title: string
  shortDescription?: string
  descriptionMd?: string
  coverImageUrl: string
  previewImageUrls?: string[]
  filePath: string
  fileName: string
  fileSizeBytes?: number
  fileMimeType?: string
  priceUsdc: string
  category?: string
  tags?: string[]
  status?: 'draft' | 'published'
}

// ─── Query Keys ──────────────────────────────────────────

export const productKeys = {
  all: ['products'] as const,
  list: (filters: Record<string, unknown>) => ['products', 'list', filters] as const,
  detail: (slug: string) => ['products', 'detail', slug] as const,
  store: (username: string) => ['products', 'store', username] as const,
  purchaseStatus: (slug: string) => ['products', 'purchaseStatus', slug] as const,
}

// ─── Hooks ───────────────────────────────────────────────

export function useProducts(filters: {
  category?: string
  sort?: string
  q?: string
  limit?: number
  offset?: number
  mine?: boolean
} = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () =>
      api.get<ProductListResponse>('/api/products', {
        category: filters.category !== 'All' ? filters.category : undefined,
        sort: filters.sort,
        q: filters.q || undefined,
        limit: filters.limit || 12,
        offset: filters.offset || 0,
        mine: filters.mine ? 'true' : undefined,
      }),
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => api.get<{ product: ProductDetail }>(`/api/products/${slug}`),
    enabled: !!slug,
  })
}

export function useStoreProducts(username: string) {
  return useQuery({
    queryKey: productKeys.store(username),
    queryFn: () =>
      api.get<{ profile: Record<string, unknown>; products: ProductListItem[] }>(
        `/api/store/${username}`
      ),
    enabled: !!username,
  })
}

export function useProductPurchaseStatus(slug: string, enabled: boolean) {
  return useQuery({
    queryKey: productKeys.purchaseStatus(slug),
    queryFn: () =>
      api.get<{ purchased: boolean; orderId: string | null }>(
        `/api/products/${slug}/purchase-status`
      ),
    enabled: !!slug && enabled,
    staleTime: 30_000,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductInput) =>
      api.post<{ product: ProductDetail }>('/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useUpdateProduct(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CreateProductInput>) =>
      api.patch<{ product: ProductDetail }>(`/api/products/${slug}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) =>
      api.delete(`/api/products/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

// ─── Upload Hooks ────────────────────────────────────────

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.upload<{ url: string; cid: string }>('/api/upload/image', formData)
    },
  })
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.upload<{ path: string; fileName: string; fileSize: number; fileMimeType: string }>(
        '/api/upload/file',
        formData
      )
    },
  })
}

export type { ProductListItem, ProductDetail, ProductListResponse, CreateProductInput }
