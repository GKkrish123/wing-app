"use client";

import { Suspense } from "react"
import { DashboardStats, DashboardActions } from "@/components/dashboard"
import { MyRequests, MyInterests, PendingFeedbacks } from "@/components/features"
import { ContentLoader } from "@/components/loading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/providers/auth-provider"

export default function DashboardIndex() {
  const { userData } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <Suspense fallback={<ContentLoader />}>
        <DashboardStats />
      </Suspense>
      
      <Suspense fallback={<ContentLoader />}>
        <DashboardActions />
      </Suspense>

      {/* Show My Requests for seekers */}
      {userData?.isSeeker && (
        <Suspense fallback={<ContentLoader />}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">My Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <MyRequests />
            </CardContent>
          </Card>
        </Suspense>
      )}

      {/* Show My Interests for helpers */}
      {userData?.isHelper && (
        <Suspense fallback={<ContentLoader />}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">My Interested Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <MyInterests />
            </CardContent>
          </Card>
        </Suspense>
      )}

      {/* Pending Feedbacks - Show for all users */}
      <Suspense fallback={<ContentLoader />}>
        <PendingFeedbacks />
      </Suspense>
    </div>
  )
}