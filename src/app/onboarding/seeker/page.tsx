"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Search, MapPin, Heart } from "lucide-react"
import { toast } from "sonner"
import { clientApi } from "@/trpc/react"
import { ThemeToggler } from "@/components/ui/theme-toggler"
import { VeilAnimation } from "@/components/ui/veil-animation"

const seekerProfileSchema = z.object({
  additionalInfo: z.string().optional(),
})

type SeekerProfileFormData = z.infer<typeof seekerProfileSchema>

export default function SeekerOnboardingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<SeekerProfileFormData>({
    resolver: zodResolver(seekerProfileSchema),
    defaultValues: {
      additionalInfo: "",
    },
  })

  const createSeekerProfileMutation = clientApi.user.createSeekerProfile.useMutation({
    onSuccess: () => {
      toast.success("Seeker profile created successfully!")
      window.location.reload()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create seeker profile")
    },
  })

  const onSubmit = async (data: SeekerProfileFormData) => {
    try {
      setIsSubmitting(true)
      await createSeekerProfileMutation.mutateAsync(data)
    } catch (error) {
      console.error("Error creating seeker profile:", error)
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
      <Card className="w-full max-w-2xl z-10 relative">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Seeker Profile Setup</CardTitle>
          <CardDescription>
            Tell us about yourself so we can help you find the right helpers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Additional Info */}
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tell us about yourself</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What kind of help do you usually need? Any specific requirements or preferences? This helps us match you with the right helpers..."
                        disabled={isSubmitting}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Features Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">What you can do as a Seeker:</h4>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <Search className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-green-900 dark:text-green-100">Find Helpers</h5>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Search for helpers based on skills, location, and availability
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900 dark:text-blue-100">Location-Based Search</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Find helpers near you and see their real-time location on the map
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-purple-900 dark:text-purple-100">Rate & Review</h5>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Rate helpers after getting help and help others make informed decisions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Permission */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Location Access</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Enable location access to find helpers near you and see their availability on the map.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || createSeekerProfileMutation.isPending}
              >
                {isSubmitting || createSeekerProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
