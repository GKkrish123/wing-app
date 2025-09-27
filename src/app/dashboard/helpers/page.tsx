"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { MapPin, Users, Wrench, Star, Clock } from "lucide-react"
import { MyConversations } from '@/components/features'

const MapView = dynamic(() => import("@/components/features/map-view").then(mod => mod.MapView), { ssr: false })

export default function HelpersDashboardPage() {
  const { userData } = useAuth()

  const helperProfile = userData?.helperProfile
  const skills = helperProfile?.expertise || []

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-green-600" />
            Welcome, {userData?.name || "Helper"}!
          </CardTitle>
          <CardDescription>
            You have {skills.length} skill{skills.length !== 1 ? 's' : ''} listed in your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {userData?.primaryLocation || "Location not set"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Currently: Helper
                {userData?.isSeeker && " • Can switch to Seeker"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {userData?.mobileNumber || "Phone not set"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Your Skills ({skills.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map((skill: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">{skill.skillName}</div>
                    {skill.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {skill.description}
                      </div>
                    )}
                  </div>
                  <Wrench className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No skills added yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add your skills to help seekers find you easily
              </p>
              <Button variant="outline">
                Add Skills
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

            {/* My Conversations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            My Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MyConversations />
        </CardContent>
      </Card>

      {/* Map Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Location
          </CardTitle>
          <CardDescription>
            Share your location to help seekers find helpers nearby
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapView showOpenRequests={true} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your helper profile and availability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span className="font-medium">Update Skills</span>
              </div>
              <p className="text-xs text-left opacity-80">
                Add or modify your skills and expertise
              </p>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Set Availability</span>
              </div>
              <p className="text-xs text-left opacity-80">
                Let seekers know when you&apos;re available
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


