import { type ReactNode, Suspense } from "react"
import { DashboardLayoutClient } from "@/components/layout"
import { ContentLoader } from "@/components/loading"

// Server component for dashboard layout
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ContentLoader />}>
      <DashboardLayoutClient>
        <div className="transition-all duration-200 ease-in-out">
          {children}
        </div>
      </DashboardLayoutClient>
    </Suspense>
  )
}