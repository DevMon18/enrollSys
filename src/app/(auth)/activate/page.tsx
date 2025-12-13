"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, GraduationCap } from "lucide-react"
import Link from "next/link"

function ActivateContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')
    
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired'>('loading')
    const [candidate, setCandidate] = useState<any>(null)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        if (!token) {
            setStatus('invalid')
            return
        }

        const validateToken = async () => {
            const { data, error } = await supabase
                .from('candidates')
                .select('*')
                .eq('invitation_token', token)
                .single()

            if (error || !data) {
                setStatus('invalid')
                return
            }

            // Check expiration
            if (new Date(data.token_expires_at) < new Date()) {
                setStatus('expired')
                return
            }

            setCandidate(data)
            setStatus('valid')
        }

        validateToken()
    }, [token])

    const handleProceed = () => {
        router.push(`/register?token=${token}`)
    }

    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[#800000] flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-[#800000]">Account Activation</CardTitle>
                <CardDescription>EnrollSys Student Portal</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
                {status === 'loading' && (
                    <div className="py-8">
                        <Loader2 className="h-12 w-12 animate-spin text-[#800000] mx-auto" />
                        <p className="mt-4 text-gray-500">Validating your invitation...</p>
                    </div>
                )}

                {status === 'valid' && candidate && (
                    <div className="py-4 space-y-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Welcome, {candidate.full_name}!
                        </h3>
                        <p className="text-gray-500">
                            Your invitation is valid. Click below to complete your registration and set up your password.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Application No:</strong> {candidate.application_no}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Email:</strong> {candidate.email}
                            </p>
                        </div>
                        <Button onClick={handleProceed} className="w-full bg-[#800000] hover:bg-[#700000] text-white">
                            Continue to Registration
                        </Button>
                    </div>
                )}

                {status === 'invalid' && (
                    <div className="py-4 space-y-4">
                        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-red-600">Invalid Invitation</h3>
                        <p className="text-gray-500">
                            This activation link is invalid or has already been used.
                        </p>
                        <Link href="/login">
                            <Button variant="outline" className="w-full">Go to Login</Button>
                        </Link>
                    </div>
                )}

                {status === 'expired' && (
                    <div className="py-4 space-y-4">
                        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                            <XCircle className="h-10 w-10 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-amber-600">Link Expired</h3>
                        <p className="text-gray-500">
                            This activation link has expired. Please contact the registrar for a new invitation.
                        </p>
                        <Link href="/login">
                            <Button variant="outline" className="w-full">Go to Login</Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function ActivatePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#800000]" />
                </div>
            }>
                <ActivateContent />
            </Suspense>
        </div>
    )
}
