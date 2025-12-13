"use client"

import { RoleBasedLayout } from "@/components/role-based-layout"
import { LayoutDashboard, FileCheck, ClipboardList } from "lucide-react"

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const sidebarLinks = [
    { label: "Dashboard", href: "/officer", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Applications", href: "/officer/applications", icon: <ClipboardList className="h-4 w-4" /> },
    { label: "Validation", href: "/officer/validation", icon: <FileCheck className="h-4 w-4" /> },
  ]

  return (
    <RoleBasedLayout sidebar={{ title: "Officer", links: sidebarLinks }}>
        {children}
    </RoleBasedLayout>
  )
}
