import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
)

export async function POST(request: NextRequest) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.error('Missing RESEND_API_KEY')
            return NextResponse.json({ error: 'Server configuration error: Missing RESEND_API_KEY' }, { status: 500 })
        }
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
            return NextResponse.json({ error: 'Server configuration error: Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
        }

        const { candidateId } = await request.json()

        if (!candidateId) {
            return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 })
        }

        // Fetch candidate
        const { data: candidate, error: fetchError } = await supabaseAdmin
            .from('candidates')
            .select('*')
            .eq('id', candidateId)
            .single()

        if (fetchError || !candidate) {
            return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
        }

        // Generate unique token
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        // Update candidate with token
        const { error: updateError } = await supabaseAdmin
            .from('candidates')
            .update({
                invitation_token: token,
                token_expires_at: expiresAt.toISOString(),
                status: 'approved'
            })
            .eq('id', candidateId)

        if (updateError) {
            console.error('Update error:', updateError)
            return NextResponse.json({ error: 'Failed to generate invitation' }, { status: 500 })
        }

        // Build activation URL
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL
        if (!baseUrl) {
            if (process.env.VERCEL_URL) {
                baseUrl = `https://${process.env.VERCEL_URL}`
            } else {
                baseUrl = 'http://localhost:3000'
            }
        }
        const activationUrl = `${baseUrl}/activate?token=${token}`

        // Send email using Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'EnrollSys <onboarding@resend.dev>', // Use your verified domain in production
            to: [candidate.email],
            subject: 'You are invited to enroll - EnrollSys',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #800000, #600000); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #800000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎓 Welcome to EnrollSys</h1>
                        </div>
                        <div class="content">
                            <h2>Hello, ${candidate.full_name}!</h2>
                            <p>Congratulations! You have been approved for enrollment.</p>
                            <p>Please click the button below to activate your account and complete your registration:</p>
                            <p style="text-align: center;">
                                <a href="${activationUrl}" class="button">Activate My Account</a>
                            </p>
                            <p><strong>Application No:</strong> ${candidate.application_no}</p>
                            <p>This link will expire in 7 days.</p>
                            <p>If you did not apply for enrollment, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} EnrollSys. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        })

        if (emailError) {
            console.error('Email error:', emailError)
            // Return success with warning so admin can copy link manually
            return NextResponse.json({
                success: true,
                message: 'Invitation generated but email failed to send (Test Mode limits?)',
                emailSent: false,
                activationUrl,
                details: emailError
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Invitation sent successfully',
            emailSent: true,
            activationUrl, // Always return it just in case
            emailId: emailData?.id
        })

    } catch (error: any) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
    }
}
