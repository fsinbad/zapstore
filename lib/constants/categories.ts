import type { ProductCategory } from '@/types'

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Templates',
  'Code',
  'Design',
  'Writing',
  'Video',
  'Music',
  'Other',
]

/** Categories with "All" prepended — for filter UIs */
export const CATEGORY_FILTERS = ['All', ...PRODUCT_CATEGORIES] as const
