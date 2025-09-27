"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, MapPin, Phone, Shield, Search, Plus } from "lucide-react"
import { ContentLoader } from "@/components/loading"

export function ProfileClient() {
  const { userData, userDataLoading } = useAuth()
  const router = useRouter()

  if (userDataLoading) {
    return <ContentLoader />
  }

  if (!userData) {
    return <ContentLoader />
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Your basic profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{userData.name}</p>
                <p className="text-sm text-muted-foreground">Full Name</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{userData.mobileNumber || "Not set"}</p>
                <p className="text-sm text-muted-foreground">Phone Number</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{userData.primaryLocation || "Not set"}</p>
                <p className="text-sm text-muted-foreground">Primary Location</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{userData.isVerified ? "Verified" : "Not verified"}</p>
                <p className="text-sm text-muted-foreground">Account Status</p>
              </div>
            </div>
          </div>
          <Button variant="outline">Edit Profile</Button>
        </CardContent>
      </Card>

      {/* Role Information */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Helper Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Helper Profile
            </CardTitle>
            <CardDescription>
              Your helper capabilities and skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userData.isHelper ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Skills</span>
                  <span className="text-sm">{userData.helperProfile?.expertise?.length || 0}</span>
                </div>
                <Button variant="outline" size="sm">
                  Manage Skills
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Helper profile not set up
                </p>
                <Button 
                  size="sm"
                  onClick={() => router.push("/onboarding/helper")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Set Up Helper Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seeker Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Seeker Profile
            </CardTitle>
            <CardDescription>
              Your seeker preferences and history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userData.isSeeker ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm text-blue-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Requests Made</span>
                  <span className="text-sm">0</span>
                </div>
                <Button variant="outline" size="sm">
                  Manage Preferences
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Seeker profile not set up
                </p>
                <Button 
                  size="sm"
                  onClick={() => router.push("/onboarding/seeker")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Set Up Seeker Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
