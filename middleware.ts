import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Try fetching the token manually
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isPublicAdminPage =
    req.nextUrl.pathname.startsWith('/admin/login') ||
    req.nextUrl.pathname.startsWith('/admin/forgot-password') ||
    req.nextUrl.pathname.startsWith('/admin/reset-password');

  if (isPublicAdminPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/admin/login?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
