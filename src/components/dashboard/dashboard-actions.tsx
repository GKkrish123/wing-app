"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { useLocation } from "@/components/providers/location-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { CreateRequestForm } from "@/components/forms"
import { MapPin, Users, MessageCircle, Plus, Loader2 } from "lucide-react"
import { ContentLoader } from "@/components/loading"
import { toast } from "sonner"

export function DashboardActions() {
  const router = useRouter()
  const { userData, userDataLoading } = useAuth()
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const { getCurrentLocation, latitude, longitude, locationSharingEnabled } = useLocation()

  const handleCreateRequest = async () => {
    setIsGettingLocation(true)
    try {
      // If location sharing is enabled and we have current location, use it
      if (locationSharingEnabled && latitude && longitude) {
        setIsCreateRequestOpen(true)
        setIsGettingLocation(false)
        return
      }

      // Otherwise, get current location
      const location = await getCurrentLocation()
      if (location) {
        setIsCreateRequestOpen(true)
      }
    } catch (error) {
      // Error already handled in getCurrentLocation
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleRequestSuccess = () => {
    setIsCreateRequestOpen(false)
    toast.success("Request created successfully!")
  }

  if (userDataLoading) {
    return <ContentLoader />
  }

  if (!userData) return null

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {userData.isSeeker && (
        <Card>
          <CardHeader>
            <CardTitle>Find Help</CardTitle>
            <CardDescription>
              Browse helpers in your area or create a new request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <Button onClick={() => router.push("/dashboard/discover")} className="flex-1">
                <MapPin className="mr-2 h-4 w-4" />
                Browse Helpers
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCreateRequest}
                disabled={isGettingLocation}
                className="flex-1"
              >
                {isGettingLocation ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {isGettingLocation ? "Getting Location..." : "New Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {userData.isHelper && (
        <Card>
          <CardHeader>
            <CardTitle>Help Others</CardTitle>
            <CardDescription>
              View nearby requests and offer your assistance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <Button onClick={() => router.push("/dashboard/discover")} className="flex-1">
                <Users className="mr-2 h-4 w-4" />
                View Requests
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/conversations")} className="flex-1">
                <MessageCircle className="mr-2 h-4 w-4" />
                My Conversations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup missing profiles */}
      {!userData.isHelper && (
        <Card>
          <CardHeader>
            <CardTitle>Become a Helper</CardTitle>
            <CardDescription>
              Set up your helper profile to start helping others in your community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/onboarding/helper")}>
              <Plus className="mr-2 h-4 w-4" />
              Set Up Helper Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {!userData.isSeeker && (
        <Card>
          <CardHeader>
            <CardTitle>Get Help</CardTitle>
            <CardDescription>
              Set up your seeker profile to find helpers when you need assistance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/onboarding/seeker")}>
              <Plus className="mr-2 h-4 w-4" />
              Set Up Seeker Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Request Drawer */}
      <Drawer open={isCreateRequestOpen} onOpenChange={setIsCreateRequestOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Request</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            {((locationSharingEnabled && latitude && longitude) || (!locationSharingEnabled)) && (
              <CreateRequestForm
                latitude={latitude || 0}
                longitude={longitude || 0}
                onSuccess={handleRequestSuccess}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
