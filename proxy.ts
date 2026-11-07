import { NextRequest } from 'next/server'

import { MIDDLEWARE_PATHNAME_HEADER } from '@/lib/constants/middleware-headers'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(MIDDLEWARE_PATHNAME_HEADER, request.nextUrl.pathname)

  const requestWithPathname = new NextRequest(request.url, {
    headers: requestHeaders,
  })

  return updateSession(requestWithPathname)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
