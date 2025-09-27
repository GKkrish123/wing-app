"use client"

import { type ReactNode } from "react"
import { AppSidebar, SiteHeader } from "@/components/layout"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface DashboardLayoutClientProps {
  children: ReactNode
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-mobile": "16rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
