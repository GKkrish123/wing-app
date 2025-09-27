"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, User, Phone, MapPin } from "lucide-react"
import { toast } from "sonner"
import { clientApi } from "@/trpc/react"
import { ThemeToggler } from "@/components/ui/theme-toggler"
import { VeilAnimation } from "@/components/ui/veil-animation"

const basicInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNumber: z.string().min(10, "Please enter a valid mobile number"),
  primaryLocation: z.string().min(2, "Please enter your primary location"),
})

type BasicInfoFormData = z.infer<typeof basicInfoSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const { userData, userDataLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Onboarding logic is handled in AuthProvider
  
  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      mobileNumber: "",
      primaryLocation: "",
    },
  })

  const updateUserMutation = clientApi.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!")
      router.push("/onboarding/role")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile")
    },
  })

  const onSubmit = async (data: BasicInfoFormData) => {
    try {
      setIsSubmitting(true)
      await updateUserMutation.mutateAsync(data)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative">
      <VeilAnimation intensity="normal" position="background" />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggler className="h-9 w-9" />
      </div>
      <Card className="w-full max-w-md z-10 relative">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Wing!</CardTitle>
          <CardDescription>
            Let&apos;s get to know you better. Please provide some basic information to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Mobile Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="primaryLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Primary Location
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City, State/Country"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || updateUserMutation.isPending}
              >
                {isSubmitting || updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
