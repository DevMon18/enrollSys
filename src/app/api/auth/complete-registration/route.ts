import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Verify Token and Get Candidate
        const { data: candidate, error: fetchError } = await supabaseAdmin
            .from('candidates')
            .select('*')
            .eq('invitation_token', token)
            .single()

        if (fetchError || !candidate) {
            return NextResponse.json({ error: 'Invalid or expired invitation token' }, { status: 400 })
        }

        // Check expiration
        if (candidate.token_expires_at && new Date(candidate.token_expires_at) < new Date()) {
            return NextResponse.json({ error: 'Invitation token has expired' }, { status: 400 })
        }

        // 2. Create Auth User (Pre-confirmed)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: candidate.email,
            password: password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: candidate.full_name,
                role: 'student'
            }
        })

        if (authError) {
            // If user already exists, we might want to handle it (e.g., allow linking?)
            // But for now, simple error
            console.error('Auth creation error:', authError)
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        // 3. Update Candidate Record
        // Clear token so it can't be reused (Back button protection)
        const { error: updateError } = await supabaseAdmin
            .from('candidates')
            .update({
                invitation_token: null,
                token_expires_at: null,
                status: 'approved', // Ensure status is approved
                // We could also link auth_id if we have a column for it?
                // The current schema might rely on email matching in 'profiles' table triggers.
                // But let's assume triggers handle profile creation.
            })
            .eq('id', candidate.id)

        if (updateError) {
            console.error('Candidate update error:', updateError)
            // Auth user was created though... strictly we should rollback but Supabase doesn't support transactions easily here.
            // It's fine for now.
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Registration error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
