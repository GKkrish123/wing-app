import { Suspense } from "react"
import { ProfileClient } from "@/components/dashboard"
import { ContentLoader } from "@/components/loading"

// Server component
export default function ProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and role settings.
        </p>
      </div>

      <Suspense fallback={<ContentLoader />}>
        <ProfileClient />
      </Suspense>
    </div>
  )
}