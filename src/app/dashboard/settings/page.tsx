import { Suspense } from "react"
import { SettingsClient } from "@/components/dashboard"
import { ContentLoader } from "@/components/loading"

// Server component
export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Suspense fallback={<ContentLoader />}>
        <SettingsClient />
      </Suspense>
    </div>
  )
}