import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicPaths = ['/', '/login', '/registrazione', '/privacy', '/termini', '/cookie', '/faq-tutor']
  const isPublicPath = publicPaths.some(p =>
    request.nextUrl.pathname === p ||
    request.nextUrl.pathname.startsWith('/registrazione') ||
    request.nextUrl.pathname.startsWith('/privacy') ||
    request.nextUrl.pathname.startsWith('/termini') ||
    request.nextUrl.pathname.startsWith('/cookie') ||
    request.nextUrl.pathname.startsWith('/faq-tutor')
  )

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (request.nextUrl.pathname === '/login')) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role
    if (role === 'studente') return NextResponse.redirect(new URL('/studente', request.url))
    if (role === 'tutor') return NextResponse.redirect(new URL('/tutor', request.url))
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}
