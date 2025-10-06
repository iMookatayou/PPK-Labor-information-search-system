import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED = ['/dashboard', '/form']

const isProtectedPath = (p) => PROTECTED.some(x => p === x || p.startsWith(x + '/'))
const isApi = (p) => p.startsWith('/api')
const isAuthRoute = (p) => p === '/login' || p.startsWith('/api/auth')
const withDebug = (res, tag) => { try { res.headers.set('x-middleware', tag) } catch {} return res }

function loginURL(req) {
  const { pathname, search } = req.nextUrl
  const redirectTarget = pathname + (search || '')
  return new URL(
    `/login?redirect=${encodeURIComponent(redirectTarget)}&reason=unauthorized`,
    req.url
  )
}

async function verifyToken(token) {
  const secret = (process.env.JWT_SECRET || '').trim()
  if (!secret) throw new Error('JWT_SECRET not set')
  const enc = new TextEncoder().encode(secret)
  const { payload } = await jwtVerify(token, enc) 
  return payload
}

export async function middleware(req) {
  const { pathname } = req.nextUrl

  if (req.headers.get('x-middleware-prefetch') === '1') {
    return NextResponse.next()
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(?:png|jpg|jpeg|gif|svg|ico|css|js|map|txt|json|woff2?|ttf|webp)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  if (isAuthRoute(pathname)) {
    return withDebug(NextResponse.next(), 'auth-route')
  }

  if (!isProtectedPath(pathname) && !isApi(pathname)) {
    return withDebug(NextResponse.next(), 'hit-public')
  }

  const token = req.cookies.get('access_token')?.value

  if (!token) {
    if (isApi(pathname)) {
      const to = loginURL(req).toString()
      return withDebug(
        NextResponse.json(
          { message: 'ยังไม่ได้เข้าสู่ระบบ', redirect_to: to },
          { status: 401, headers: { 'X-Redirect-To': to, 'Cache-Control': 'no-store' } }
        ),
        'no-token-api'
      )
    }
    return withDebug(NextResponse.redirect(loginURL(req), { status: 302 }), 'no-token-page')
  }

  try {
    await verifyToken(token)
    return withDebug(NextResponse.next(), 'ok-token')
  } catch {
    if (isApi(pathname)) {
      const to = loginURL(req).toString()
      const res = NextResponse.json(
        { message: 'token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่', redirect_to: to },
        { status: 401, headers: { 'X-Redirect-To': to, 'Cache-Control': 'no-store' } }
      )
      res.cookies.set('access_token', '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      return withDebug(res, 'bad-token-api')
    }

    const res = NextResponse.redirect(loginURL(req), { status: 302 })
    res.cookies.set('access_token', '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return withDebug(res, 'bad-token-page')
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)',
  ],
}
