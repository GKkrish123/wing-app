"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { clientApi } from "@/trpc/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, MessageCircle, AlertTriangle } from "lucide-react"
import { ContentLoader } from "@/components/loading"

export function DashboardStats() {
  const { userData, userDataLoading } = useAuth()
  const { data: pendingFeedbacks } = clientApi.payment.getPendingFeedbacks.useQuery()

  if (userDataLoading) {
    return <ContentLoader />
  }

  if (!userData) return null

  const totalPendingFeedbacks = (pendingFeedbacks?.asSeeker?.length || 0) + (pendingFeedbacks?.asHelper?.length || 0)

  return (
    <>
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {userData.name}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your Wing account today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Role</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData.currentRole === "HELPER" ? "Helper" : 
               userData.currentRole === "SEEKER" ? "Seeker" : "Not Set"}
            </div>
            <p className="text-xs text-muted-foreground">
              {userData.isHelper && userData.isSeeker ? "Can switch between both" : "Active mode"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData.primaryLocation ? "Set" : "Not Set"}
            </div>
            <p className="text-xs text-muted-foreground">
              {userData.primaryLocation || "Update your location"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Active chats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedbacks</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${totalPendingFeedbacks > 0 ? 'text-amber-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPendingFeedbacks > 0 ? 'text-amber-600' : ''}`}>
              {totalPendingFeedbacks}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalPendingFeedbacks > 0 ? 'Feedback required' : 'All feedback provided'}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
