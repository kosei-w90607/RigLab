import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    if (!req.auth) {
      return NextResponse.redirect(
        new URL('/signin?callbackUrl=/admin', req.url)
      )
    }
    if (req.auth.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
})

export const config = {
  matcher: ['/admin/:path*'],
}
