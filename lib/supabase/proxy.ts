import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()

  const user = data?.claims
  let pathname = request.nextUrl.pathname

  // Handle malformed URLs where ? is encoded as %3F
  // This can happen when URLs are double-encoded or copied incorrectly
  // Only process if we haven't already normalized (check for redirect loop prevention)
  if ((pathname.includes('%3F') || pathname.includes('%3f')) && !request.nextUrl.searchParams.has('_normalized')) {
    // Extract the path and query from the malformed URL
    const match = pathname.match(/^(.+?)(?:%3F|%3f)(.+)$/)
    if (match) {
      const [, actualPath, queryString] = match
      const url = request.nextUrl.clone()
      url.pathname = actualPath
      // Parse and set query params from the query string
      const params = new URLSearchParams(queryString)
      params.forEach((value, key) => {
        url.searchParams.set(key, value)
      })
      // Add a flag to prevent redirect loops
      url.searchParams.set('_normalized', '1')
      return NextResponse.redirect(url)
    }
  }

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/otp',
    '/auth',
    '/invite/accept', // Allow invite acceptance for both authenticated and unauthenticated users
    // Cron jobs: Bearer CRON_SECRET, no session cookie. Auth is authorizeCronRequest.
    '/api/auth/jobs',
    '/terms',
    '/privacy',
  ]

  // Auth pages that authenticated users shouldn't access (exclude /auth/* for OAuth callbacks)
  const authPages = ['/sign-in', '/sign-up', '/forgot-password', '/otp']

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if the current path is an auth page (not including /auth/* callbacks)
  const isAuthPage = authPages.some((route) => pathname.startsWith(route))

  // If user is not authenticated and trying to access a protected route, redirect to sign-in
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access auth pages, redirect to home
  // Don't redirect from /auth/* routes as they're needed for OAuth callbacks
  // Also don't redirect if there's an error parameter (user might be seeing an error message)
  // Or if the redirect parameter points to an invite URL (to allow invite flow to complete)
  if (user && isAuthPage) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    const hasError = request.nextUrl.searchParams.has('error')
    const isInviteRedirect = redirectParam?.includes('/invite/accept')
    
    // Only redirect if there's no error and it's not an invite redirect
    if (!hasError && !isInviteRedirect) {
      const url = request.nextUrl.clone()
      url.pathname = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/'
      url.search = '' // Clear search params
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

