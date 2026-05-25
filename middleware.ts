import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "estateos_token";

const PROTECTED_PREFIXES = ["/dashboard", "/platform", "/residents", "/security", "/pending-kyc", "/pending-estate"];

const AUTH_ROUTES = ["/login", "/signup", "/register-estate"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = !!request.cookies.get(AUTH_COOKIE)?.value;

  if (isProtectedPath(pathname) && !hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/platform/:path*",
    "/residents/:path*",
    "/security/:path*",
    "/pending-kyc",
    "/pending-estate",
    "/login",
    "/signup",
    "/register-estate",
  ],
};
