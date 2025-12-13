"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { GraduationCap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing your invitation...')
  const [userRole, setUserRole] = useState<string>('student')
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      try {
        // Get the hash from the URL (contains access_token, refresh_token, etc.)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            throw error
          }

          if (data.user) {
            // Fetch user role from profiles
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .single()

            const role = profile?.role || data.user.user_metadata?.role || 'student'
            setUserRole(role)

            if (type === 'invite') {
              setStatus('success')
              setMessage('Your account has been activated successfully!')
              
              // Redirect to appropriate dashboard after a short delay
              setTimeout(() => {
                router.push(`/${role}`)
              }, 2500)
            } else {
              // For other auth types (email confirmation, password reset, etc.)
              setStatus('success')
              setMessage('Authentication successful!')
              
              setTimeout(() => {
                router.push(`/${role}`)
              }, 2000)
            }
          }
        } else {
          // No tokens in URL, check if there's an existing session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single()

            const role = profile?.role || 'student'
            router.push(`/${role}`)
          } else {
            setStatus('error')
            setMessage('No authentication tokens found. Please try the link again or request a new invitation.')
          }
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error.message || 'An error occurred during authentication.')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#800000] to-[#a00000] flex items-center justify-center shadow-lg mx-auto">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">EnrollSys</CardTitle>
          <CardDescription>Account Activation</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="h-12 w-12 animate-spin text-[#800000] mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to EnrollSys!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting you to your {userRole} dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Activation Failed
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <div className="flex gap-3 justify-center">
                <Link href="/login">
                  <Button className="bg-[#800000] hover:bg-[#600000]">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
