"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { GraduationCap, LogOut, Menu, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { createClient, type Profile } from "@/lib/supabase"

interface SidebarProps {
  title: string
  links: { label: string; href: string; icon: React.ReactNode }[]
}

export function RoleBasedLayout({ children, sidebar }: { children: React.ReactNode, sidebar: SidebarProps }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (profile) {
          setUser(profile)
        }
      }
    }

    fetchUser()
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm">
        {/* Logo Section */}
        <div className="p-5 h-20 flex items-center gap-3 border-b border-gray-100">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#800000] to-[#a00000] flex items-center justify-center shadow-lg shadow-[#800000]/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-900 tracking-tight">EnrollSys</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Management Portal</span>
          </div>
        </div>
        
        {/* Portal Label */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{sidebar.title} Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {sidebar.links.map((link) => {
              const isActive = pathname === link.href || (link.href !== `/${sidebar.title.toLowerCase()}` && pathname.startsWith(link.href))
              return (
                <li key={link.href}>
                  <Link href={link.href}>
                    <div className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? "bg-gradient-to-r from-[#800000] to-[#900000] text-white shadow-md shadow-[#800000]/20" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}>
                      <span className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-[#800000]"} transition-colors`}>
                        {link.icon}
                      </span>
                      <span className="font-medium text-sm">{link.label}</span>
                      {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-white/50"></div>}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#800000] to-[#a00000] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{sidebar.title}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 border-b border-gray-200 flex items-center px-6 bg-white justify-between sticky top-0 z-10 shadow-sm">
          {/* Mobile Menu */}
          <div className="md:hidden font-bold text-[#800000] flex items-center gap-2">
            <Menu className="h-6 w-6" />
            <GraduationCap className="h-6 w-6" />
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search students, documents..." 
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">3</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 lg:p-8 bg-gray-50/50">
          <div className="mx-auto max-w-[1600px] space-y-8">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-gray-200 bg-white text-center">
          <p className="text-xs text-gray-500">© 2024 EnrollSys. Campus Enrollment Management System.</p>
        </footer>
      </main>
    </div>
  )
}
