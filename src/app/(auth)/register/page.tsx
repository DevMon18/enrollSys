"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, GraduationCap, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"

function RegisterContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')
    
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [candidate, setCandidate] = useState<any>(null)
    
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        if (!token) {
            router.push('/activate')
            return
        }

        const validateToken = async () => {
            const { data, error } = await supabase
                .from('candidates')
                .select('*')
                .eq('invitation_token', token)
                .single()

            if (error || !data) {
                router.push('/activate')
                return
            }

            if (new Date(data.token_expires_at) < new Date()) {
                router.push('/activate?expired=true')
                return
            }

            setCandidate(data)
            setLoading(false)
        }

        validateToken()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setSubmitting(true)

        try {
            // Create Supabase Auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: candidate.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: candidate.full_name,
                        role: 'student'
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // Clear the invitation token so it can't be reused
                await supabase
                    .from('candidates')
                    .update({ 
                        invitation_token: null,
                        token_expires_at: null,
                        status: 'approved'
                    })
                    .eq('id', candidate.id)

                setSuccess(true)
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <Loader2 className="h-12 w-12 animate-spin text-[#800000]" />
    }

    if (success) {
        return (
            <Card className="w-full max-w-md shadow-xl">
                <CardContent className="pt-8 text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registration Complete!</h2>
                    <p className="text-gray-500">
                        Your account has been created successfully. You can now log in to access your student portal.
                    </p>
                    <Link href="/login">
                        <Button className="w-full bg-[#800000] hover:bg-[#700000] text-white">
                            Go to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[#800000] flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-[#800000]">Complete Registration</CardTitle>
                <CardDescription>Set up your password to finish account creation</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Name:</strong> {candidate?.full_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Email:</strong> {candidate?.email}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-[#800000] hover:bg-[#700000] text-white"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#800000]" />
                </div>
            }>
                <RegisterContent />
            </Suspense>
        </div>
    )
}
