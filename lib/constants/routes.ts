export const ROUTES = {
  // Public
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT: (slug: string) => `/products/${slug}`,
  STORE: (username: string) => `/store/${username}`,
  SEARCH: '/search',

  // Buyer Auth
  CHECKOUT: (productId: string) => `/checkout/${productId}`,
  PURCHASE_SUCCESS: (orderId: string) => `/purchase/success/${orderId}`,
  MY_PURCHASES: '/my-purchases',
  CLAIM: (token: string) => `/claim/${token}`,

  // Creator Auth
  DASHBOARD: '/dashboard',
  DASHBOARD_PRODUCTS: '/dashboard/products',
  DASHBOARD_PRODUCTS_NEW: '/dashboard/products/new',
  DASHBOARD_PRODUCT_EDIT: (id: string) => `/dashboard/products/${id}/edit`,
  DASHBOARD_SALES: '/dashboard/sales',
  DASHBOARD_PAYOUTS: '/dashboard/payouts',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  ONBOARDING: '/onboarding',

  // Auth
  AUTH_CALLBACK: '/auth/callback',
  AUTH_LOGOUT: '/auth/logout',
} as const

export const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/search',
]

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/my-purchases',
  '/checkout',
  '/onboarding',
]
