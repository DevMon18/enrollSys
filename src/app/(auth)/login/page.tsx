"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from '@supabase/ssr'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: "" })
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Basic validation
    if (!email.trim()) {
      setErrorDialog({ open: true, message: "Please enter your email address." })
      setLoading(false)
      return
    }

    if (!password) {
      setErrorDialog({ open: true, message: "Please enter your password." })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
         // Fetch profile to check role
         const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

         const role = profile?.role || 'student' // Default fallback
         router.push(`/${role}`)
      }
    } catch (err: any) {
      let message = "An unexpected error occurred. Please try again."
      if (err.message.includes("Invalid login")) {
        message = "Invalid email or password. Please check your credentials."
      } else if (err.message.includes("Email not confirmed")) {
        message = "Please verify your email before logging in."
      } else {
        message = err.message
      }
      setErrorDialog({ open: true, message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#800000] via-[#6a0000] to-[#500000] relative overflow-hidden">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <GraduationCap className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">EnrollSys</h1>
              <p className="text-white/70 text-sm tracking-wider uppercase">Campus Enrollment</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-semibold mb-4 leading-tight">
            Streamlined Enrollment<br />
            Management System
          </h2>
          
          <p className="text-white/70 text-lg max-w-md mb-8 leading-relaxed">
            A comprehensive platform designed to simplify student enrollment, document verification, and academic management for your institution.
          </p>
          
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold">5,000+</p>
              <p className="text-white/60 text-sm">Active Students</p>
            </div>
            <div>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-white/60 text-sm">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-white/60 text-sm">System Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#800000] to-[#a00000] flex items-center justify-center shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">EnrollSys</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500">Sign in to access your portal</p>
          </div>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                    <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@campus.edu"
                        className="pl-12 h-12 bg-gray-50 border-gray-200 focus:border-[#800000] focus:ring-[#800000]/20 text-base"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                    <Link href="#" className="text-sm text-[#800000] hover:underline font-medium">
                        Forgot password?
                    </Link>
                    </div>
                    <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-12 pr-12 h-12 bg-gray-50 border-gray-200 focus:border-[#800000] focus:ring-[#800000]/20 text-base"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    </div>
                </div>

                <Button disabled={loading} type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#800000] to-[#900000] hover:from-[#700000] hover:to-[#800000] shadow-lg shadow-[#800000]/25 transition-all duration-300 group">
                    {loading ? "Signing In..." : "Sign In"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-500">Need help?</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500">
                Contact the Registrar's Office for account assistance
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-400 mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Login Failed
            </AlertDialogTitle>
            <AlertDialogDescription>
              {errorDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ open: false, message: "" })}>
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
