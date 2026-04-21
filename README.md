# ZapStore

Gasless digital product marketplace built on Starknet with the [Starkzap SDK](https://starkzap.io). Creators list and sell digital goods — PDFs, templates, code, design assets — and receive payment in USDC. Buyers check out with Google sign-in, pay zero gas, and get instant file delivery. No wallet, no seed phrase, no blockchain knowledge required.

## Why ZapStore

| Problem | ZapStore |
|---------|----------|
| Traditional platforms take 10%+ per sale | 5% platform fee — majority of USDC goes straight to creator wallet |
| Crypto payments require MetaMask + ETH for gas | Gasless checkout via AVNU Paymaster — buyers and creators pay zero gas |
| Buyers need a wallet to pay with crypto | Starkzap + Privy social login creates an embedded Starknet wallet silently |
| Creators rely on platform escrow | Self-custodied revenue — withdraw anytime to any Starknet address, gas-free |

## How It Works

**For buyers:**
1. Browse products (no account needed)
2. Click "Buy Now" — sign in with Google or email via Privy
3. Starkzap creates an embedded Starknet wallet automatically (no seed phrase shown)
4. Pay in USDC — AVNU Paymaster sponsors gas, buyer pays $0 in fees
5. File downloads instantly via a single-use secure token

**For creators:**
1. Sign in with Google — Starkzap onboards with Privy strategy and prepares an embedded wallet
2. List a product: upload a file, set price in USDC, add description and cover image
3. On every sale, `wallet.transfer()` sends USDC split directly to creator wallet and platform fee recipient — no escrow
4. Check live USDC balance on the dashboard; swap STRK ↔ USDC gas-free via AVNU
5. Withdraw USDC to any external Starknet address — gas sponsored by AVNU paymaster

## Built on Starkzap

Starkzap is the **only** onchain layer in ZapStore. Every wallet, payment, swap, and gas operation flows through the Starkzap SDK.

### Starkzap Modules Used

| Module | Location | Purpose |
|--------|----------|---------|
| `new StarkZap({ network, paymaster })` | `lib/starkzap.ts` | SDK init with AVNU paymaster proxy |
| `sdk.onboard({ strategy: Privy, accountPreset: 'openzeppelin' })` | `hooks/useWallet.ts` | Social login + embedded wallet creation |
| `wallet.ensureReady({ deploy: 'if_needed', feeMode: 'sponsored' })` | `hooks/useWallet.ts` | Deploys account on-chain for free before first tx |
| `wallet.balanceOf(USDC)` | `hooks/usePurchaseFlow.ts`, `hooks/useWallet.ts` | Balance check before purchase; dashboard display |
| `wallet.transfer(USDC, transfers, { feeMode: 'sponsored' })` | `hooks/usePurchaseFlow.ts` | Gasless split payment to creator + platform fee |
| `wallet.transfer(USDC, [...])` | payouts page | Gasless USDC withdrawal to external address |
| `wallet.swap({ tokenIn, tokenOut, amountIn }, { feeMode: 'sponsored' })` | `WalletFundingDialog`, payouts page | Gasless STRK ↔ USDC swaps via AVNU |
| `wallet.getQuote({ tokenIn, tokenOut, amountIn })` | `WalletFundingDialog`, payouts page | Real-time swap quotes |
| `wallet.registerSwapProvider(new AvnuSwapProvider())` | `hooks/useWallet.ts` | Registers AVNU as default swap provider |
| `tx.watch({ pollIntervalMs, timeoutMs, onError })` | `hooks/usePurchaseFlow.ts`, payouts page | L2 finality polling with transient-error handling |
| `getPresets(wallet.getChainId())` | Throughout | Resolves USDC/STRK token addresses for the chain |
| `Amount.parse(value, token)` | Throughout | Human-readable → on-chain token amount |
| `Amount.fromRaw(base, token)` | Swap quote display | On-chain base units → human-readable |
| `fromAddress(addr)` | Payment, withdrawal | Converts Starknet address string to transfer target |

### Checkout Payment Flow

```
Buyer clicks "Buy Now"
  │
  ▼
Privy auth (Google/email) → sdk.onboard({ strategy: Privy, accountPreset: 'openzeppelin' })
  ├── /api/auth/signer-context  →  get-or-create app-managed Privy wallet
  └── /api/auth/sign            →  server rawSign(walletId, hash)
  │
  ▼
wallet.balanceOf(USDC)  →  insufficient? show WalletFundingDialog (swap/deposit)
  │
  ▼
wallet.ensureReady({ deploy: 'if_needed', feeMode: 'sponsored' })
  │  ── deploys OpenZeppelin account on first tx, gas covered by AVNU
  │
  ▼
wallet.transfer(USDC, [creatorAmount, platformFeeAmount], { feeMode: 'sponsored' })
  │  ── gasless split payment — pendingTxHash saved to prevent double-charge on retry
  │
  ▼
tx.watch({ pollIntervalMs: 5000, timeoutMs: 180000 })
  │  ── ignores transient "not found" (RPC indexing lag), retries up to 180s
  │  ── resolves on ACCEPTED_ON_L2
  │
  ▼
POST /api/orders/[id]/confirm  →  mark completed, generate SHA-256 download token
  │
  ▼
triggerBlobDownload(signedUrl, fileName)  →  blob fetch → browser save dialog
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Blockchain | **Starkzap SDK** — wallets, payments, swaps, gas sponsorship |
| Auth & Wallet | Privy (`@privy-io/react-auth`, `@privy-io/server-auth`, `@privy-io/node`) |
| Account Type | OpenZeppelin (starknet.js v9 compatible; see integration guide) |
| Gas Sponsorship | AVNU Paymaster — all transactions sponsored via server-side proxy |
| Database | Supabase (PostgreSQL + Drizzle ORM) |
| File Storage | Supabase Storage (private bucket, signed URLs) |
| Image Storage | Pinata / IPFS (public cover images) |
| State | Zustand |
| Email | Resend |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Supabase project
- Privy app (embedded wallets enabled, app-managed wallets)
- AVNU Paymaster API key ([portal.avnu.fi](https://portal.avnu.fi))
- Pinata account (IPFS image uploads)
- Resend account (transactional email)

### Setup

```bash
git clone https://github.com/jes-labs/zapstore.git
cd zapstore
pnpm install
cp .env.example .env.local   # fill in your keys
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# Privy
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=

# Starknet
NEXT_PUBLIC_STARKNET_NETWORK=sepolia           # or mainnet
# NEXT_PUBLIC_STARKNET_RPC_URL=               # leave unset → Starkzap uses Cartridge.gg default

# AVNU Paymaster (gas sponsorship — server-only, never exposed to client)
NEXT_PUBLIC_AVNU_PAYMASTER_URL=https://sepolia.paymaster.avnu.fi
AVNU_PAYMASTER_API_KEY=                        # proxied via /api/paymaster

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=                                  # Supabase pooler connection string

# Pinata (IPFS)
PINATA_JWT=
NEXT_PUBLIC_PINATA_GATEWAY_URL=

# Email
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com

# Platform fee
PLATFORM_FEE_RECIPIENT=0x...                  # Starknet address to receive platform cut
PLATFORM_FEE_BPS=500                          # 500 = 5%

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Database

Schema defined in `lib/db/schema.ts` (Drizzle ORM). Tables: `users`, `products`, `orders`, `download_tokens`, `withdrawals`.

> **Note:** `drizzle-kit push` has a known crash (v0.31) when introspecting Supabase schemas with check constraints. Run the initial migration manually using the `postgres` package if this occurs.

### Scripts

```bash
pnpm dev      # Dev server with Turbopack
pnpm build    # Production build
pnpm lint     # ESLint
```

## Project Structure

```
zapstore/
├── app/
│   ├── (public)/           # Marketplace — homepage, products, store pages
│   ├── (dashboard)/        # Creator dashboard — products, sales, payouts, settings
│   ├── api/
│   │   ├── auth/           # Privy signer-context, sign, sync
│   │   ├── products/       # CRUD + purchase-status
│   │   ├── orders/         # Create, confirm
│   │   ├── purchases/      # Reissue download tokens
│   │   ├── claim/          # Single-use file download
│   │   ├── withdrawals/    # Record + list creator withdrawals
│   │   ├── paymaster/      # AVNU proxy (keeps API key server-side)
│   │   └── upload/         # Image + file upload to Supabase/Pinata
│   └── layout.tsx          # Root layout — providers, fonts, theme
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── shared/             # ProductCard, WalletFundingDialog, PriceDisplay, etc.
│   ├── layout/             # DashboardShell, Sidebar, TopBar, MobileNav
│   └── landing/            # PublicNav (account dropdown + sign out), PublicFooter
├── hooks/
│   ├── useWallet.ts        # Wallet connection, balance, deploy, swap, logout
│   └── usePurchaseFlow.ts  # Full checkout state machine
├── lib/
│   ├── starkzap.ts         # SDK init with AVNU paymaster proxy
│   ├── db/                 # Drizzle schema + client
│   ├── api/                # Typed fetch client (auto-auth, 401 retry)
│   └── auth.ts             # requireUser() — Privy token verification
└── store/                  # Zustand — walletStore, authStore
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Privy user ID, app-managed wallet ID, Starknet address, profile |
| `products` | Listings — title, file path, USDC price, status |
| `orders` | Purchases — buyer, creator, amount, tx hash, status, completedAt |
| `download_tokens` | SHA-256 hashed single-use tokens, 72h expiry |
| `withdrawals` | Creator withdrawal history — amount, destination address, tx hash |
