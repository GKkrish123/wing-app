import { Loader2 } from "lucide-react"

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-primary/20"></div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Loading...</p>
          <p className="text-xs text-muted-foreground">Please wait a moment</p>
        </div>
      </div>
    </div>
  )
}

export function ContentLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading content...</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-6 animate-fade-in">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4 skeleton"></div>
        <div className="h-3 bg-muted rounded w-1/2 skeleton"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded skeleton"></div>
          <div className="h-3 bg-muted rounded w-5/6 skeleton"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
