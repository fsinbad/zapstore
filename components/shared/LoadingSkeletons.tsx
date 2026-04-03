import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 py-4">
        <Skeleton className="h-10 w-[250px] rounded-xl" />
        <Skeleton className="h-10 w-[100px] rounded-xl" />
      </div>
      <div className="rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-4 bg-muted/20 border-b border-border/50 flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-5 flex gap-4 border-b border-border/10 last:border-0">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="border-border/50 bg-card overflow-hidden rounded-3xl">
          <Skeleton className="aspect-video w-full rounded-none" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-border/50 bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>
        </Card>
      ))}
    </div>
  )
}
