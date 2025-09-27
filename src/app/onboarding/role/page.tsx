"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Users, Search, Heart, Shield, Clock } from "lucide-react"
import { toast } from "sonner"
import { ThemeToggler } from "@/components/ui/theme-toggler"
import { VeilAnimation } from "@/components/ui/veil-animation"

type UserRole = "HELPER" | "SEEKER"

export default function RoleSelectionPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Onboarding logic is handled in AuthProvider

  const handleRoleSelect = (role: UserRole) => {
    if (isSubmitting) return
    setSelectedRole(role)
  }

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error("Please select a role")
      return
    }

    try {
      setIsSubmitting(true)
      
      // Navigate to the appropriate onboarding page to set up the profile
      if (selectedRole === "HELPER") {
        router.push("/onboarding/helper")
      } else if (selectedRole === "SEEKER") {
        router.push("/onboarding/seeker")
      }
    } catch (error) {
      console.error("Error navigating:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative">
      <VeilAnimation intensity="normal" position="background" />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggler className="h-9 w-9" />
      </div>
      <Card className="w-full max-w-2xl z-10 relative">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Your First Role</CardTitle>
          <CardDescription>
            How would you like to start using Wing? You can always set up the other role later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Helper Card */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRole === "HELPER" 
                  ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20" 
                  : "hover:shadow-md"
              }`}
              onClick={() => handleRoleSelect("HELPER")}
            >
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Helper</CardTitle>
                <CardDescription>
                  Offer your skills and services to help others in your community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-green-500" />
                    Help people in need
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    Set your own schedule
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    Build your reputation
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Seeker Card */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRole === "SEEKER" 
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                  : "hover:shadow-md"
              }`}
              onClick={() => handleRoleSelect("SEEKER")}
            >
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Seeker</CardTitle>
                <CardDescription>
                  Find and connect with helpers who can assist you with your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-500" />
                    Find nearby helpers
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Get help when you need it
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Connect with your community
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <Button 
              onClick={handleContinue}
              disabled={isSubmitting || !selectedRole}
              className="w-full max-w-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Redirecting...
                </>
              ) : (
                selectedRole ? `Set up ${selectedRole.toLowerCase()} profile` : "Select a role to continue"
              )}
            </Button>
            {!selectedRole && (
              <p className="text-sm text-muted-foreground">Please select a role to continue</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
