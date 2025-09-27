"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggler } from "@/components/ui/theme-toggler"
import { useAuth } from "@/components/providers/auth-provider"
import { clientApi } from "@/trpc/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const { userData } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const currentRole = pathname?.includes("/seekers") ? "seekers" : 
                     pathname?.includes("/helpers") ? "helpers" : "dashboard"
  const switchTo = currentRole === "helpers" ? "seekers" : "helpers"

  const switchRoleMutation = clientApi.user.switchToRole.useMutation({
    onSuccess: () => {
      toast.success(`Switched to ${switchTo} mode`)
      router.push(`/dashboard/${switchTo}`)
    },
    onError: (error) => {
      if (error.message === "NEED_HELPER_PROFILE") {
        toast.info("Set up your helper profile first")
        router.push("/onboarding/helper")
      } else if (error.message === "NEED_SEEKER_PROFILE") {
        toast.info("Set up your seeker profile first")
        router.push("/onboarding/seeker")
      } else {
        toast.error("Failed to switch role")
      }
    }
  })

  const handleRoleSwitch = () => {
    const targetRole = switchTo === "helpers" ? "HELPER" : "SEEKER"
    switchRoleMutation.mutate({ role: targetRole })
  }

  // Create breadcrumb based on current path
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: any[] = []
    
    if (segments.length > 1) {
      breadcrumbs.push({ label: "Dashboard", href: "/dashboard" })
      
      if (segments[1] === "helpers") {
        breadcrumbs.push({ label: "Helper View", href: "/dashboard/helpers" })
      } else if (segments[1] === "seekers") {
        breadcrumbs.push({ label: "Seeker View", href: "/dashboard/seekers" })
      } else {
        breadcrumbs.push({ 
          label: segments[1].charAt(0).toUpperCase() + segments[1].slice(1), 
          href: pathname 
        })
      }
    }
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.length === 0 ? (
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.href}>
                  <BreadcrumbItem className={cn(index === 0 && "hidden md:block")}>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className={cn(index === 0 && "hidden md:block")}/>}
                </React.Fragment>
              ))
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="ml-auto flex items-center gap-2 px-4">
        {/* Role switching for users with multiple profiles */}
        {(userData?.isHelper && userData?.isSeeker) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRoleSwitch}
            disabled={switchRoleMutation.isPending}
          >
            {switchRoleMutation.isPending ? "Switching..." : `Switch to ${switchTo === "helpers" ? "Helper" : "Seeker"}`}
          </Button>
        )}
        
        <ThemeToggler />
      </div>
    </header>
  )
}