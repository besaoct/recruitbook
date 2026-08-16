import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "reqruitbook_session";

// Public paths that do not require authentication
const PUBLIC_PREFIXES = [
  "/login",
  "/careers",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/icon.png",
  "/logo.png",
];

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // 1. Check if the path is explicitly public
  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // 2. If logged in and visiting /login, redirect to dashboard
  if (pathname === "/login") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 3. If accessing root "/", redirect based on auth status
  if (pathname === "/") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4. If not a public route and user has no session cookie, redirect to login
  if (!isPublic && !sessionCookie) {
    const redirectTarget = `${pathname}${search}`;
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
