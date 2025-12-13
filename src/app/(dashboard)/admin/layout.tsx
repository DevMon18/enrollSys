"use client"

import { RoleBasedLayout } from "@/components/role-based-layout"
import { LayoutDashboard, Users, UserCog, Settings, FileSpreadsheet } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const sidebarLinks = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Candidates", href: "/admin/candidates", icon: <FileSpreadsheet className="h-4 w-4" /> },
    { label: "User Management", href: "/admin/users", icon: <UserCog className="h-4 w-4" /> },
    { label: "System Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <RoleBasedLayout sidebar={{ title: "Admin", links: sidebarLinks }}>
        {children}
    </RoleBasedLayout>
  )
}
