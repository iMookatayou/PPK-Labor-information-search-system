import { NextResponse } from 'next/server';
import { verifyToken } from './src/app/lib/jwt';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const user = token && verifyToken(token);

  const isProtected = request.nextUrl.pathname.startsWith('/dashboard');

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
