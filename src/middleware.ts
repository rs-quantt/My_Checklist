
import { getToken } from 'next-auth/jwt';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Define protected routes
  const protectedRoutes = ['/admin', '/my-checklist', '/studio'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If the route is not protected, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // If the route is protected, check for authentication
  const token = await getToken({ req });
  
  // If user is not logged in, redirect to the login page without a callbackUrl
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in but tries to access admin routes without admin role
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    // Redirect to the home page
    const homeUrl = new URL('/', req.url);
    return NextResponse.redirect(homeUrl);
  }

  // If the user is authenticated and authorized, proceed
  return NextResponse.next();
}

export const config = {
  // Matcher to run the middleware on specific paths
  matcher: ['/admin/:path*', '/my-checklist', '/studio/:path*'],
};
