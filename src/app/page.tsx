"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if there are auth tokens in the URL hash (from Supabase invitation/magic links)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      
      if (accessToken) {
        // Redirect to auth callback page with the hash intact
        router.push(`/auth/callback${window.location.hash}`)
        return
      }
    }
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <main className="flex flex-col items-center gap-8 text-center p-8">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#800000] to-[#a00000] flex items-center justify-center shadow-xl shadow-[#800000]/20">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Welcome to EnrollSys</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            The centralized enrollment and management system for EVSU Computer Studies Department.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg" className="bg-[#800000] hover:bg-[#600000] shadow-lg">
              Go to Login
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
