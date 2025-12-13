'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Server Action to invite a candidate via Supabase Auth Admin.
 * This requires SUPABASE_SERVICE_ROLE_KEY to be set in .env.local
 */
export async function inviteCandidateAction(candidateId: string, email: string, fullName: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        return {
            success: false,
            error: 'Missing server configuration (SUPABASE_SERVICE_ROLE_KEY). Please add this to your .env.local file.'
        }
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        // 1. Send Invite Email (creates Auth User)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                full_name: fullName,
                role: 'student' // This metadata can be used by triggers to set public.profile role
            },
            redirectTo: `${supabaseUrl.replace('.supabase.co', '.vercel.app')}/update-password` // Optional: redirect to a specific page
            // Actually, standard setup usually redirects to the site URL.
            // Let's rely on default or siteURL settings in Supabase dashboard.
        })

        if (authError) {
            // If user already exists, we might want to just update the candidate record anyway?
            // Or return error.
            console.error('Supabase Invite Error:', authError)
            return { success: false, error: authError.message }
        }

        // 2. Update Candidate Record
        const { error: dbError } = await supabaseAdmin
            .from('candidates')
            .update({
                invited_at: new Date().toISOString(),
                status: 'approved' // Automatically approve invited candidates
            })
            .eq('id', candidateId)

        if (dbError) {
            console.error('Database Update Error:', dbError)
            return { success: false, error: 'User invited but failed to update candidate record: ' + dbError.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Invitation Action Error:', error)
        return { success: false, error: error.message || 'Unknown error occurred' }
    }
}
