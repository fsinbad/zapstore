export type OrderStatus = 'pending' | 'completed' | 'failed'

export type CheckoutState =
  | 'login'
  | 'balance_check'
  | 'insufficient'
  | 'ready'
  | 'processing'
  | 'success'
  | 'error'

export type ClaimState =
  | 'validating'
  | 'ready'
  | 'used'
  | 'expired'
  | 'invalid'

export interface Sale {
  id: string
  product: string
  amount: number
  buyer: string
  txHash: string
  date: string
  status: OrderStatus
}

export interface Purchase {
  id: string
  orderId: string
  product: {
    title: string
    slug: string
    creator: {
      username: string
      avatar: string
    }
  }
  amount: number
  date: string
  canDownload: boolean
}

export interface Withdrawal {
  id: string
  amount: number
  destination: string
  txHash: string
  date: string
  status: string
}

export interface OrderConfirmation {
  id: string
  product: {
    title: string
    fileName: string
  }
  amount: number
  txHash: string
  email: string
  claimToken: string
}
