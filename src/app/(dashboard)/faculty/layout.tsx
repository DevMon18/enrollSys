"use client"

import { RoleBasedLayout } from "@/components/role-based-layout"
import { LayoutDashboard, BookOpen, GraduationCap } from "lucide-react"

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const sidebarLinks = [
    { label: "Dashboard", href: "/faculty", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "My Classes", href: "/faculty/classes", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Grading", href: "/faculty/grading", icon: <GraduationCap className="h-4 w-4" /> },
  ]

  return (
    <RoleBasedLayout sidebar={{ title: "Faculty", links: sidebarLinks }}>
        {children}
    </RoleBasedLayout>
  )
}
