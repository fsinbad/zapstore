import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <p className="text-8xl font-black font-heading text-primary/20">404</p>
          <h1 className="text-2xl font-bold font-heading">Page not found</h1>
          <p className="text-muted-foreground text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild className="rounded-xl">
            <Link href={ROUTES.HOME}>Go Home</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={ROUTES.PRODUCTS}>Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
