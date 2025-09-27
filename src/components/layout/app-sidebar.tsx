"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDashboard,
  IconSearch,
  IconShield,
  IconMessageCircle,
  IconUser,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react"

import { NavMain, NavSecondary, NavUser, LocationSettings } from "@/components/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { VeilAnimation } from "@/components/ui/veil-animation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userData } = useAuth()

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Discover",
      url: "/dashboard/discover",
      icon: IconSearch,
    },
    {
      title: "Conversations",
      url: "/dashboard/conversations",
      icon: IconMessageCircle,
    },
  ]

  const navSecondary = [
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: IconUser,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Help & Support",
      url: "/dashboard/help",
      icon: IconHelp,
    },
  ]

  const user = {
    name: userData?.name || "User",
    email: userData?.mobileNumber || "No phone set",
    avatar: userData?.profilePicture || "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-6 h-6">
                  <VeilAnimation 
                    intensity="prominent" 
                    position="inline" 
                    size="sm"
                    className="w-full h-full"
                  />
                </div>
                <span className="text-base font-semibold">Wing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <NavMain items={navMain} />
        <SidebarSeparator />
        <SidebarMenu className="px-2">
          <LocationSettings />
        </SidebarMenu>
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
