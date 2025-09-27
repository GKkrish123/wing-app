import { SkeletonList } from "@/components/loading"

export default function HelpersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
      <SkeletonList count={4} />
    </div>
  )
}
