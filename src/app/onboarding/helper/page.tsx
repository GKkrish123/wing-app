"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Plus, X, Wrench, Star, MapPin } from "lucide-react"
import { toast } from "sonner"
import { clientApi } from "@/trpc/react"
import { ThemeToggler } from "@/components/ui/theme-toggler"
import { VeilAnimation } from "@/components/ui/veil-animation"

const helperProfileSchema = z.object({
  skills: z.array(z.object({
    skillName: z.string().min(1, "Skill name is required"),
    description: z.string().optional(),
  })).min(1, "Please add at least one skill"),
  additionalInfo: z.string().optional(),
})

type HelperProfileFormData = z.infer<typeof helperProfileSchema>

export default function HelperOnboardingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<HelperProfileFormData>({
    resolver: zodResolver(helperProfileSchema),
    defaultValues: {
      skills: [{ skillName: "", description: "" }],
      additionalInfo: "",
    },
  })

  const createHelperProfileMutation = clientApi.user.createHelperProfile.useMutation({
    onSuccess: () => {
      toast.success("Helper profile created successfully!")
      window.location.reload()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create helper profile")
    },
  })

  const addSkill = () => {
    const currentSkills = form.getValues("skills")
    form.setValue("skills", [...currentSkills, { skillName: "", description: "" }])
  }

  const removeSkill = (index: number) => {
    const currentSkills = form.getValues("skills")
    if (currentSkills.length > 1) {
      form.setValue("skills", currentSkills.filter((_, i) => i !== index))
    }
  }

  const onSubmit = async (data: HelperProfileFormData) => {
    try {
      setIsSubmitting(true)
      await createHelperProfileMutation.mutateAsync(data)
    } catch (error) {
      console.error("Error creating helper profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const skills = form.watch("skills")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative">
      <VeilAnimation intensity="normal" position="background" />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggler className="h-9 w-9" />
      </div>
      <Card className="w-full max-w-2xl z-10 relative">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Helper Profile Setup</CardTitle>
          <CardDescription>
            Tell us about your skills and expertise to help people find you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Skills Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Your Skills</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSkill}
                    disabled={isSubmitting}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
                
                {skills.map((_, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <FormField
                        control={form.control}
                        name={`skills.${index}.skillName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skill Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Plumbing, Tutoring, Cooking"
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
                        name={`skills.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of your expertise in this skill"
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {skills.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSkill(index)}
                        disabled={isSubmitting}
                        className="mt-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about yourself, your experience, availability, or any other relevant information..."
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Permission */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Location Access</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Enable location access to help seekers find you nearby and show your availability on the map.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || createHelperProfileMutation.isPending}
              >
                {isSubmitting || createHelperProfileMutation.isPending ? (
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
