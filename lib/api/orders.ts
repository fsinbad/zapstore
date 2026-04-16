import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

// ─── Types ───────────────────────────────────────────────

interface CreateOrderResponse {
  orderId: string
  creatorWallet: string
  amountUsdc: string         // total the buyer pays
  creatorAmountUsdc: string  // creator receives (after fee)
  feeAmountUsdc: string      // platform fee portion
  feeRecipient: string | null
}

interface ConfirmOrderResponse {
  orderId: string
  downloadToken: string
  claimUrl: string
}

interface OrderDetail {
  id: string
  productId: string
  buyerId: string
  creatorId: string
  amountUsdc: string
  starknetTxHash: string | null
  status: string
  createdAt: string
  completedAt: string | null
  product?: {
    title: string
    slug: string
    coverImageUrl: string
    fileName: string
  }
  buyer?: {
    starknetAddress: string | null
  }
  creator?: {
    displayName: string | null
    username: string | null
  }
}

interface PurchaseItem {
  id: string
  amountUsdc: string
  status: string
  completedAt: string | null
  product: {
    title: string
    slug: string
    coverImageUrl: string
    fileName: string
  }
  creator: {
    displayName: string | null
    username: string | null
  }
}

interface SaleItem {
  orderId: string
  productId: string
  amountUsdc: string
  starknetTxHash: string | null
  completedAt: string | null
  productTitle: string
  buyerAddress: string | null
}

interface SalesResponse {
  sales: SaleItem[]
  total: number
  limit: number
  offset: number
}

interface ReissueResponse {
  downloadToken: string
  claimUrl: string
}

// ─── Query Keys ──────────────────────────────────────────

export const orderKeys = {
  all: ['orders'] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
  purchases: ['orders', 'purchases'] as const,
  sales: (filters: Record<string, unknown>) => ['orders', 'sales', filters] as const,
}

// ─── Hooks ───────────────────────────────────────────────

export function useCreateOrder() {
  return useMutation({
    mutationFn: (productId: string) =>
      api.post<CreateOrderResponse>('/api/orders', { productId }),
  })
}

export function useConfirmOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, txHash }: { orderId: string; txHash: string }) =>
      api.post<ConfirmOrderResponse>(`/api/orders/${orderId}/confirm`, { txHash }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => api.get<{ order: OrderDetail }>(`/api/orders/${orderId}`),
    enabled: !!orderId,
  })
}

export function useMyPurchases() {
  return useQuery({
    queryKey: orderKeys.purchases,
    queryFn: () => api.get<{ purchases: PurchaseItem[] }>('/api/orders/my-purchases'),
  })
}

export function useSales(filters: {
  product?: string
  limit?: number
  offset?: number
} = {}) {
  return useQuery({
    queryKey: orderKeys.sales(filters),
    queryFn: () =>
      api.get<SalesResponse>('/api/dashboard/sales', {
        product: filters.product,
        limit: filters.limit || 20,
        offset: filters.offset || 0,
      }),
  })
}

export function useReissueToken() {
  return useMutation({
    mutationFn: (orderId: string) =>
      api.post<ReissueResponse>(`/api/purchases/${orderId}/reissue`),
  })
}

export type {
  CreateOrderResponse,
  ConfirmOrderResponse,
  OrderDetail,
  PurchaseItem,
  SaleItem,
  SalesResponse,
  ReissueResponse,
}
