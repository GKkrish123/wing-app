import { ContentLoader } from "@/components/loading"

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ContentLoader />
    </div>
  )
}
