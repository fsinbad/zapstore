import type React from "react"
import type { Metadata, Viewport } from "next"
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ReactQueryProvider from "@/components/providers/ReactQueryProvider"
import PrivyProvider from "@/components/providers/PrivyProvider"
import { Toaster } from "@/components/ui/sonner"
import { NetworkStatus } from "@/components/shared/NetworkStatus"

const fontHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700"],
})

const fontBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://zapstore-one.vercel.app"),
  title: {
    default: "ZapStore — Gasless Digital Product Storefront",
    template: "%s | ZapStore",
  },
  description:
    "Sell digital products with gasless USDC checkout on Starknet. 5% platform fee, self-custodied revenue, no MetaMask required.",
  keywords: [
    "digital products",
    "Starknet",
    "USDC",
    "gasless",
    "marketplace",
    "Starkzap",
    "creator",
    "sell digital goods",
  ],
  authors: [{ name: "ZapStore" }],
  creator: "ZapStore",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "ZapStore — Gasless Digital Product Storefront",
    description:
      "Gumroad rebuilt on Starknet. Gasless checkout in USDC, 5% platform fee, self-custodied creator revenue.",
    siteName: "ZapStore",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZapStore — Gasless Digital Product Storefront",
    description:
      "Sell digital products with gasless USDC checkout. Powered by Starknet.",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontHeading.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyProvider>
            <ReactQueryProvider>
              {children}
              <NetworkStatus />
              <Toaster richColors closeButton position="bottom-right" />
            </ReactQueryProvider>
          </PrivyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
