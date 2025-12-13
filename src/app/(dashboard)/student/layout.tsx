"use client"

import { RoleBasedLayout } from "@/components/role-based-layout"
import { LayoutDashboard, FileText, User } from "lucide-react"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const sidebarLinks = [
    { label: "Dashboard", href: "/student", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Enrollment", href: "/student/enrollment", icon: <FileText className="h-4 w-4" /> },
    { label: "Profile", href: "/student/profile", icon: <User className="h-4 w-4" /> },
  ]

  return (
    <RoleBasedLayout sidebar={{ title: "Student", links: sidebarLinks }}>
        {children}
    </RoleBasedLayout>
  )
}
