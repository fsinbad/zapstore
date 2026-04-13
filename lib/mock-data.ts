import type {
  ProductCardData,
  Product,
  DashboardProduct,
  Sale,
  Purchase,
  Withdrawal,
  OrderConfirmation,
  CreatorProfile,
} from '@/types'

// ─── Creators ────────────────────────────────────────────

export const MOCK_CREATORS: Record<string, CreatorProfile> = {
  devpro: {
    username: 'devpro',
    displayName: 'DevPro Studio',
    avatar: 'DP',
    bio: 'Building production-ready developer tools and SaaS templates. Shipping high-quality code so you can focus on what matters.',
    memberSince: 'April 2026',
  },
  designlab: {
    username: 'designlab',
    displayName: 'DesignLab',
    avatar: 'DL',
    bio: 'Premium design resources for modern creators.',
    memberSince: 'March 2026',
  },
  aiteacher: {
    username: 'aiteacher',
    displayName: 'AI Teacher',
    avatar: 'AT',
    bio: 'Making machine learning accessible through hands-on courses.',
    memberSince: 'March 2026',
  },
}

// ─── Products (card-level data) ──────────────────────────

export const MOCK_PRODUCTS: ProductCardData[] = [
  { id: '1', slug: 'nextjs-saas-template', title: 'Next.js SaaS Starter Kit', shortDescription: 'Production-ready SaaS template with auth, billing, and dashboard', price: 49.00, category: 'Templates', coverImageUrl: null, creator: { username: 'devpro', avatar: 'DP', avatarUrl: null } },
  { id: '2', slug: 'icon-pack-3d', title: '3D Icon Pack — 200+ Icons', shortDescription: 'Beautiful 3D rendered icons for web and mobile apps', price: 29.00, category: 'Design', coverImageUrl: null, creator: { username: 'designlab', avatar: 'DL', avatarUrl: null } },
  { id: '3', slug: 'python-ml-course', title: 'Python ML Masterclass', shortDescription: 'Complete machine learning course with real-world projects', price: 79.00, category: 'Video', coverImageUrl: null, creator: { username: 'aiteacher', avatar: 'AT', avatarUrl: null } },
  { id: '4', slug: 'tailwind-components', title: 'Tailwind Component Library', shortDescription: '150+ responsive components built with Tailwind CSS', price: 39.00, category: 'Code', coverImageUrl: null, creator: { username: 'uicraft', avatar: 'UC', avatarUrl: null } },
  { id: '5', slug: 'copywriting-guide', title: 'The Copywriting Playbook', shortDescription: 'Write copy that converts — templates and frameworks included', price: 19.00, category: 'Writing', coverImageUrl: null, creator: { username: 'wordsmith', avatar: 'WS', avatarUrl: null } },
  { id: '6', slug: 'lofi-beats-pack', title: 'Lo-Fi Beats Sample Pack', shortDescription: '50 royalty-free lo-fi beats for content creators', price: 24.00, category: 'Music', coverImageUrl: null, creator: { username: 'beatmaker', avatar: 'BM', avatarUrl: null } },
  { id: '7', slug: 'react-native-kit', title: 'React Native Boilerplate', shortDescription: 'Cross-platform app starter with navigation and auth', price: 59.00, category: 'Code', coverImageUrl: null, creator: { username: 'mobildev', avatar: 'MD', avatarUrl: null } },
  { id: '8', slug: 'brand-identity-kit', title: 'Brand Identity Kit', shortDescription: 'Logo templates, color palettes, typography guide', price: 34.00, category: 'Design', coverImageUrl: null, creator: { username: 'brandco', avatar: 'BC', avatarUrl: null } },
  { id: '9', slug: 'email-templates', title: 'Email Marketing Templates', shortDescription: '25 conversion-optimized email templates', price: 15.00, category: 'Templates', coverImageUrl: null, creator: { username: 'emailpro', avatar: 'EP', avatarUrl: null } },
  { id: '10', slug: 'video-editing-luts', title: 'Cinematic LUTs Pack', shortDescription: '30 professional color grading LUTs', price: 22.00, category: 'Video', coverImageUrl: null, creator: { username: 'filmgrade', avatar: 'FG', avatarUrl: null } },
  { id: '11', slug: 'notion-templates', title: 'Notion Life OS', shortDescription: 'Complete life management system in Notion', price: 12.00, category: 'Templates', coverImageUrl: null, creator: { username: 'notionpro', avatar: 'NP', avatarUrl: null } },
  { id: '12', slug: 'ambient-sounds', title: 'Ambient Sound Library', shortDescription: '100 ambient sounds for focus and relaxation', price: 18.00, category: 'Music', coverImageUrl: null, creator: { username: 'soundscapes', avatar: 'SS', avatarUrl: null } },
]

/** First 6 products — used on the marketplace homepage */
export const FEATURED_PRODUCTS = MOCK_PRODUCTS.slice(0, 6)

/** Products belonging to the "devpro" creator */
export const DEVPRO_PRODUCTS = MOCK_PRODUCTS.filter(
  (p) => p.creator.username === 'devpro' || ['1', '4', '7', '9'].includes(p.id)
)

// ─── Single product detail (full) ────────────────────────

export const MOCK_PRODUCT_DETAIL: Product = {
  id: '1',
  slug: 'nextjs-saas-template',
  title: 'Next.js SaaS Starter Kit',
  shortDescription: 'Production-ready SaaS template with auth, billing, and dashboard',
  descriptionMd: `## What's included\n\n- **Authentication** — Email/password, OAuth, magic links\n- **Billing** — Stripe integration with subscription management\n- **Dashboard** — Admin panel with analytics\n- **Landing Page** — Conversion-optimized marketing page\n- **Email Templates** — Transactional emails via Resend\n\n## Tech Stack\n\nNext.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Stripe\n\n## Who is this for?\n\nDevelopers who want to ship their SaaS product fast without building boilerplate from scratch.`,
  price: 49.00,
  category: 'Templates',
  tags: ['nextjs', 'saas', 'typescript', 'tailwind'],
  coverImageUrl: null,
  previewImageUrls: [],
  fileName: 'nextjs-saas-starter-v2.zip',
  fileSize: '12.4 MB',
  fileMimeType: 'application/zip',
  status: 'published',
  salesCount: 342,
  totalRevenueUsdc: 16758.00,
  createdAt: '2026-03-15T10:00:00Z',
  updatedAt: '2026-04-01T14:30:00Z',
  creator: {
    username: 'devpro',
    displayName: 'DevPro Studio',
    avatar: 'DP',
    bio: 'Building production-ready developer tools',
    productCount: 8,
  },
}

// ─── Dashboard products ──────────────────────────────────

export const MOCK_DASHBOARD_PRODUCTS: DashboardProduct[] = [
  { id: '1', title: 'Next.js SaaS Starter Kit', slug: 'nextjs-saas-template', price: 49.00, status: 'published', category: 'Templates', salesCount: 342, revenue: 16758.00 },
  { id: '2', title: '3D Icon Pack — 200+ Icons', slug: 'icon-pack-3d', price: 29.00, status: 'published', category: 'Design', salesCount: 128, revenue: 3712.00 },
  { id: '3', title: 'Python ML Masterclass', slug: 'python-ml-course', price: 79.00, status: 'draft', category: 'Video', salesCount: 0, revenue: 0 },
  { id: '4', title: 'Tailwind Component Library', slug: 'tailwind-components', price: 39.00, status: 'published', category: 'Code', salesCount: 256, revenue: 9984.00 },
  { id: '5', title: 'Email Marketing Templates', slug: 'email-templates', price: 15.00, status: 'published', category: 'Templates', salesCount: 89, revenue: 1335.00 },
]

// ─── Sales ───────────────────────────────────────────────

export const MOCK_SALES: Sale[] = [
  { id: '1', product: 'Next.js SaaS Starter Kit', amount: 49.00, buyer: '0x1234567890abcdef1234567890abcdef12345678', txHash: '0xabc123def456abc123def456abc123def456abc1abc123def456abc123def456ab', date: '2026-04-03 14:30', status: 'completed' },
  { id: '2', product: 'Tailwind Component Library', amount: 39.00, buyer: '0x9876543210fedcba9876543210fedcba98765432', txHash: '0xdef456abc123def456abc123def456abc123def4def456abc123def456abc123de', date: '2026-04-03 09:15', status: 'completed' },
  { id: '3', product: '3D Icon Pack', amount: 29.00, buyer: '0xabcdef1234567890abcdef1234567890abcdef12', txHash: '0x789012345678901234567890123456789012345678901234567890123456789012', date: '2026-04-02 18:45', status: 'completed' },
  { id: '4', product: 'Email Marketing Templates', amount: 15.00, buyer: '0x5555111122223333444455556666777788889999', txHash: '0x111222333444555666777888999000111222333444555666777888999000111222', date: '2026-04-02 12:00', status: 'completed' },
  { id: '5', product: 'React Native Boilerplate', amount: 59.00, buyer: '0x7777333344445555666677778888999900001111', txHash: '0x444555666777888999000111222333444555666777888999000111222333444555', date: '2026-04-01 20:30', status: 'completed' },
  { id: '6', product: 'Next.js SaaS Starter Kit', amount: 49.00, buyer: '0xaaaa2222bbbb3333cccc4444dddd5555eeee6666', txHash: '0x555666777888999000111222333444555666777888999000111222333444555666', date: '2026-04-01 10:00', status: 'completed' },
]

// ─── Purchases (buyer side) ──────────────────────────────

export const MOCK_PURCHASES: Purchase[] = [
  { id: '1', orderId: 'order-001', product: { title: 'Next.js SaaS Starter Kit', slug: 'nextjs-saas-template', creator: { username: 'devpro', avatar: 'DP' } }, amount: 49.00, date: '2026-04-03', canDownload: true },
  { id: '2', orderId: 'order-002', product: { title: 'Tailwind Component Library', slug: 'tailwind-components', creator: { username: 'uicraft', avatar: 'UC' } }, amount: 39.00, date: '2026-03-20', canDownload: true },
  { id: '3', orderId: 'order-003', product: { title: '3D Icon Pack', slug: 'icon-pack-3d', creator: { username: 'designlab', avatar: 'DL' } }, amount: 29.00, date: '2026-02-15', canDownload: false },
]

// ─── Withdrawals ─────────────────────────────────────────

export const MOCK_WITHDRAWALS: Withdrawal[] = [
  { id: '1', amount: 500.00, destination: '0xabcd1234567890abcdef1234567890abcdef1234', txHash: '0x111222333444555666777888999000111222333444555666777888999000111222', date: '2026-04-01', status: 'completed' },
  { id: '2', amount: 250.00, destination: '0xabcd1234567890abcdef1234567890abcdef1234', txHash: '0x222333444555666777888999000111222333444555666777888999000111222333', date: '2026-03-28', status: 'completed' },
]

// ─── Order confirmation (post-purchase) ──────────────────

export const MOCK_ORDER_CONFIRMATION: OrderConfirmation = {
  id: 'mock-order-123',
  product: { title: 'Next.js SaaS Starter Kit', fileName: 'nextjs-saas-starter-v2.zip' },
  amount: 49.00,
  txHash: '0xabc123def456abc123def456abc123def456abc1abc123def456abc123def456ab',
  email: 'buyer@example.com',
  claimToken: 'mock-claim-token-abc',
}

// ─── Dashboard stats ─────────────────────────────────────

export const MOCK_WALLET_ADDRESS = '0x0742d35Cc6634C0532925a3b844Bc9e7595f2bD3AbCdEf1234567890AbCdEf12'
export const MOCK_WALLET_BALANCE = 1890.00
