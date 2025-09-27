"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { clientApi } from "@/trpc/react"
import { MapPin, Users, Search, Star, Plus, Clock } from "lucide-react"
import { MyRequests } from '@/components/features';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CreateRequestForm } from "@/components/forms"

const MapView = dynamic(() => import("@/components/features/map-view").then(mod => mod.MapView), { ssr: false })

export default function SeekersDashboardPage() {
  const { userData } = useAuth()
  const [isCreateRequestSheetOpen, setCreateRequestSheetOpen] = useState(false)
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null })

  if (!userData?.isSeeker) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <p className="text-muted-foreground">You need to set up your seeker profile first.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Welcome, {userData?.name || "Seeker"}!
          </CardTitle>
          <CardDescription>
            Find helpers in your area who can assist you with your needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-sm">Real-time Location</h4>
                <p className="text-xs text-muted-foreground">Updates every 30 seconds when active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-sm">Currently: Seeker</h4>
                <p className="text-xs text-muted-foreground">{userData?.isHelper ? "Can switch to Helper" : "Ready to find help"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Star className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-sm">4.9 Rating</h4>
                <p className="text-xs text-muted-foreground">From helpers you&apos;ve worked with</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Section */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Nearby Helpers
          </CardTitle>
          <CardDescription>
            See helpers in your area. Click on markers to learn about their skills and availability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[60vh]">
            <MapView 
              className="h-full" 
              showNearbyUsers={true}
              radiusKm={10}
              onLocationChange={(latitude, longitude) => setLocation({ latitude, longitude })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Request
            </CardTitle>
            <CardDescription>
              Need help with something? Create a request and find helpers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Sheet open={isCreateRequestSheetOpen} onOpenChange={setCreateRequestSheetOpen}>
              <SheetTrigger asChild>
                <Button className="w-full h-auto p-4 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">New Request</span>
                  </div>
                  <p className="text-xs text-center opacity-80">
                    Describe what you need help with
                  </p>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Create a New Request</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  {location.latitude && location.longitude ? (
                    <CreateRequestForm
                      latitude={location.latitude}
                      longitude={location.longitude}
                      onSuccess={() => setCreateRequestSheetOpen(false)}
                    />
                  ) : (
                    <p>Getting your location...</p>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              My Requests
            </CardTitle>
            <CardDescription>
              Track your active and completed requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MyRequests />
          </CardContent>
        </Card>
      </div>

      {/* Search Helpers */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Helpers
          </CardTitle>
          <CardDescription>
            Find helpers by skill or browse by category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              "Plumbing", "Electrical", "Tutoring", "Cooking",
              "Cleaning", "Moving", "Tech Support", "Gardening"
            ].map((skill) => (
              <Button
                key={skill}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <span className="font-medium text-sm">{skill}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


