import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Helper function to get user role
    const getUserRole = async () => {
        if (!user) return null
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        return profile?.role || 'student'
    }

    // Protected Routes Pattern
    if (request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/student') ||
        request.nextUrl.pathname.startsWith('/officer') ||
        request.nextUrl.pathname.startsWith('/faculty')) {

        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Role-based access control
        const role = await getUserRole()
        const path = request.nextUrl.pathname

        // Prevent users from accessing dashboards they don't have permission for
        if (path.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }
        if (path.startsWith('/officer') && role !== 'officer' && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }
        if (path.startsWith('/faculty') && role !== 'faculty' && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }
    }

    // Auth Routes (Login/Register) - Redirect to dashboard if already logged in
    if (request.nextUrl.pathname === '/login') {
        if (user) {
            const role = await getUserRole()
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
