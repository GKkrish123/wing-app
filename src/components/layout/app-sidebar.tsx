"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
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
import { GradientOrb, ParticleField } from "@/components/ui/floating-elements"
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
    <Sidebar collapsible="icon" {...props} className="relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleField density={8} className="opacity-30" />
        <GradientOrb size="sm" color="primary" className="top-10 -left-5 opacity-20" />
        <GradientOrb size="sm" color="secondary" className="bottom-20 -right-5 opacity-20" />
      </div>
      
      <motion.div
        className="relative z-10 h-full"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <Link href="/dashboard" className="flex items-center gap-3">
                  <motion.div 
                    className="w-8 h-8 relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <VeilAnimation 
                        intensity="prominent" 
                        position="inline" 
                        size="sm"
                        className="w-5 h-5"
                      />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Wing
                    </span>
                    <div className="text-xs text-muted-foreground -mt-1">
                      Platform
                    </div>
                  </motion.div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        
        <SidebarContent className="overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <NavMain items={navMain} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="my-4"
          >
            <SidebarSeparator className="bg-gradient-to-r from-transparent via-border to-transparent" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <SidebarMenu className="px-2">
              <LocationSettings />
            </SidebarMenu>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="mt-auto"
          >
            <NavSecondary items={navSecondary} />
          </motion.div>
        </SidebarContent>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <SidebarFooter>
            <NavUser user={user} />
          </SidebarFooter>
        </motion.div>
      </motion.div>
    </Sidebar>
  )
}
