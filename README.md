# ZapStore

Gasless digital product marketplace built on Starknet with the [Starkzap SDK](https://starkzap.io). Creators list and sell digital goods — PDFs, templates, code, design assets, videos, music — and accept payment in USDC. Buyers check out with Google sign-in, pay zero gas, and get instant file delivery. No wallet, no seed phrase, no blockchain knowledge required.

**Live demo:** [zapstore.xyz](https://zapstore.xyz)

## Why ZapStore

| Problem | ZapStore |
|---------|----------|
| Gumroad takes 10%+ per sale | 0% platform fee — USDC goes straight to creator wallet |
| Crypto payments require MetaMask + ETH for gas | Gasless checkout via AVNU Paymaster — buyer pays nothing extra |
| Buyers need a wallet to pay with crypto | Starkzap + Privy social login creates an embedded Starknet wallet behind the scenes |
| Creators rely on platform escrow | Self-custodied revenue — withdraw anytime to any Starknet address |

## How It Works

**For buyers:**
1. Browse products on the marketplace (no account needed)
2. Click "Buy Now" — sign in with Google or email
3. Starkzap creates an embedded Starknet wallet automatically (no seed phrase)
4. Pay in USDC — AVNU Paymaster sponsors gas so the buyer pays $0 in fees
5. Get a secure download link instantly + email receipt

**For creators:**
1. Sign in with Google — Starkzap onboards with Privy strategy and deploys an embedded wallet
2. List a product: title, description, file upload, set price in USDC
3. On every sale, `wallet.transfer()` sends USDC directly to the creator's wallet — no escrow
4. Check live balance with `wallet.balanceOf(USDC)` on the dashboard
5. Withdraw USDC to any external Starknet address (`feeMode: 'user_pays'`)

## Built on Starkzap

Starkzap (`npm install starkzap`) is the **only** payment, wallet, and onchain layer in ZapStore. There are no workarounds, wrappers, or alternative providers. Every onchain interaction flows through the Starkzap SDK.

### Starkzap Modules Used

| Starkzap Module | Where It's Used | What It Does |
|----------------|-----------------|--------------|
| `StarkZap({ network: 'mainnet' })` | SDK initialization (`lib/starkzap.ts`) | Configures the SDK for Starknet mainnet |
| `sdk.onboard({ strategy: OnboardStrategy.Privy })` | Login flow (buyer + creator) | Social login via Privy, creates embedded wallet, no seed phrase shown |
| `wallet.balanceOf(USDC)` | Checkout page, dashboard payouts | Checks buyer balance before purchase; shows creator's live USDC balance |
| `wallet.transfer(USDC, [...], { feeMode: 'sponsored' })` | Checkout payment | Executes gasless USDC transfer from buyer to creator via AVNU Paymaster |
| `wallet.transfer(USDC, [...], { feeMode: 'user_pays' })` | Creator withdrawal | Creator moves USDC from embedded wallet to external address (pays own gas) |
| `tx.watch({ pollIntervalMs, timeoutMs })` | Post-payment confirmation | Polls for L2 finality, triggers order confirmation + download token generation |
| `getPresets(wallet.getChainId())` | Token resolution | Resolves mainnet USDC contract address from chain presets |
| `Amount.parse(price, USDC)` | Payment + withdrawal | Parses human-readable USDC amounts to on-chain format (6 decimals) |
| `fromAddress(creatorWallet)` | Payment routing | Converts creator's Starknet address for transfer target |
| `wallet.address` | Settings, receipts | Displays creator's Starknet wallet address |

### Starkzap Integration Flow

```
Buyer clicks "Buy Now"
  │
  ▼
sdk.onboard({ strategy: OnboardStrategy.Privy, feeMode: 'sponsored' })
  │  ── Privy handles Google/email login
  │  ── Starkzap creates embedded Starknet wallet
  │  ── AVNU Paymaster configured for zero-gas
  │
  ▼
wallet.balanceOf(USDC)
  │  ── If insufficient → show on-ramp guidance modal
  │  ── If sufficient → proceed to payment
  │
  ▼
wallet.transfer(USDC, [{ to: creatorAddress, amount }], { feeMode: 'sponsored' })
  │  ── Gasless ERC-20 transfer from buyer to creator
  │  ── No gas prompt, no MetaMask popup, no tx hash shown to buyer
  │
  ▼
tx.watch(({ finality }) => ..., { pollIntervalMs: 5000, timeoutMs: 180000 })
  │  ── Polls Starknet for ACCEPTED_ON_L2
  │  ── On success → create order record, generate download token, send emails
  │  ── On timeout (180s) → show friendly error, log for debugging
  │
  ▼
Purchase complete → redirect to /purchase/success/[orderId]
```

### Code: Full Checkout Sequence

```typescript
import { StarkZap, OnboardStrategy, Amount, fromAddress, getPresets } from 'starkzap';

// 1. Initialize (once, in a provider)
const sdk = new StarkZap({ network: 'mainnet' });

// 2. Onboard buyer — Privy social login + embedded wallet + gasless
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Privy,
  privy: {
    resolve: async () => {
      const res = await fetch('/api/auth/signer-context', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json(); // { walletId, publicKey, serverUrl }
    },
  },
  accountPreset: 'argentXV050',
  feeMode: 'sponsored',  // AVNU Paymaster — buyer pays zero gas
  deploy: 'if_needed',
});

// 3. Check balance
const { USDC } = getPresets(wallet.getChainId());
const balance = await wallet.balanceOf(USDC);

if (balance.lt(Amount.parse(productPrice, USDC))) {
  // Show on-ramp guidance modal
  return;
}

// 4. Execute gasless payment
const tx = await wallet.transfer(USDC, [{
  to: fromAddress(creatorWalletAddress),
  amount: Amount.parse(productPrice, USDC),
}]);

// 5. Wait for L2 confirmation
const stop = tx.watch(({ finality }) => {
  if (finality === 'ACCEPTED_ON_L2') {
    confirmOrder(tx.hash); // server-side: create order, generate download token, send email
    stop();
  }
}, { pollIntervalMs: 5000, timeoutMs: 180000 });
```

### Code: Creator Withdrawal

```typescript
// Creator withdraws from embedded wallet to external address
// feeMode: 'user_pays' — creator pays their own gas (they're power users)
const tx = await wallet.transfer(USDC, [{
  to: fromAddress(destinationAddress),
  amount: Amount.parse(withdrawAmount, USDC),
}], { feeMode: 'user_pays' });

await tx.wait();
```

### Why Starkzap Was the Right Choice

- **One SDK for everything** — auth, wallets, payments, gas sponsorship, tx monitoring. No need to stitch together Starknet.js + Privy + a separate paymaster SDK.
- **Privy onboarding strategy** — `sdk.onboard()` handles signer setup, wallet creation, deployment, and paymaster config in a single call. Without this, we'd need 50+ lines of boilerplate per user.
- **Built-in AVNU Paymaster support** — `feeMode: 'sponsored'` is a one-liner. The buyer never sees a gas prompt.
- **`tx.watch()` with polling** — clean abstraction over Starknet finality polling. No manual RPC calls or retry loops.
- **Token presets** — `getPresets(chainId).USDC` resolves the correct mainnet USDC address without hardcoding contract addresses.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS v4, Shadcn/ui |
| Blockchain | **Starkzap SDK**, Starknet Mainnet, USDC |
| Auth & Wallet | Privy via Starkzap `OnboardStrategy.Privy` |
| Gas Sponsorship | AVNU Paymaster via Starkzap `feeMode: 'sponsored'` |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage (private bucket — product files) |
| Image Storage | Pinata/IPFS (public — cover images, previews) |
| ORM | Drizzle ORM |
| Email | Resend |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Setup

```bash
git clone https://github.com/jes-labs/zapstore.git
cd zapstore
pnpm install
cp .env.example .env.local  # then fill in your keys
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# Privy (Starkzap auth strategy)
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Pinata (IPFS image uploads)
PINATA_JWT=
NEXT_PUBLIC_PINATA_GATEWAY_URL=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=noreply@zapstore.xyz

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
DOWNLOAD_TOKEN_SECRET=              # 32-char random string
STARKNET_RPC_URL=                   # optional
```

### Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm lint       # Run ESLint
```

## Project Structure

```
zapstore/
├── app/
│   ├── (public)/              # Marketplace — homepage, products, store, search
│   ├── (dashboard)/           # Creator dashboard — overview, products, sales, payouts, settings
│   ├── checkout/              # Buyer checkout flow (Starkzap payment)
│   ├── purchase/              # Post-purchase success page
│   ├── my-purchases/          # Buyer purchase history
│   ├── claim/                 # Secure file download
│   ├── auth/                  # Privy OAuth callback + logout
│   └── layout.tsx             # Root layout (providers, fonts, theme)
├── components/
│   ├── ui/                    # Shadcn/ui primitives (56 components)
│   ├── shared/                # ProductCard, PriceDisplay, AddressDisplay, TxLink, etc.
│   ├── layout/                # DashboardShell, Sidebar, TopBar, MobileNav
│   └── landing/               # PublicNav, PublicFooter
├── types/                     # Centralized TypeScript types (Product, Order, User, etc.)
├── lib/
│   ├── constants/             # Routes, categories, animation variants
│   ├── mock-data.ts           # Fixture data (replaced by Supabase in production)
│   └── utils.ts               # Tailwind merge utility
├── store/                     # Zustand stores
└── hooks/                     # Custom React hooks
```

## Database Schema

Four tables in Supabase (PostgreSQL):

| Table | Purpose |
|-------|---------|
| `users` | Privy user ID, Starknet wallet address (from Starkzap), profile |
| `products` | Listings — title, description, price in USDC, file path, category, status |
| `orders` | Purchase records — buyer, creator, USDC amount, Starknet tx hash, status |
| `download_tokens` | SHA-256 hashed tokens with 72h expiry for secure file delivery |

Row Level Security (RLS) enforced at the database level. Product files stored in a private Supabase Storage bucket, accessible only via server-generated signed URLs. Cover images stored on IPFS via Pinata.

## Deployment

```bash
pnpm build
vercel deploy --prod
```

Pre-deployment checklist:
- All environment variables set in Vercel project settings
- Privy app configured for mainnet with embedded wallets enabled
- AVNU Paymaster: confirm USDC transfer sponsorship is active on mainnet
- Supabase storage bucket set to private
- Resend domain verified (SPF/DKIM)
- Run full e2e checkout test on mainnet with real USDC

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT
