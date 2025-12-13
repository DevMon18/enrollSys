"use client"

import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Type definitions for our database tables
export interface Profile {
    id: string
    email: string
    full_name: string | null
    role: 'admin' | 'officer' | 'student' | 'faculty'
    created_at: string
}

export interface Candidate {
    id: string
    application_no: string
    full_name: string
    email: string
    contact_number: string | null
    status: 'pending' | 'approved' | 'rejected'
    invited_at: string | null
    created_at: string
}

export interface Subject {
    id: string
    code: string
    title: string
    units: number
    created_at: string
}

export interface RequiredDocument {
    id: string
    name: string
    student_type: 'freshman' | 'transferee'
    created_at: string
}
