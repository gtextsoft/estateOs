import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { redirectIfWrongRoleArea } from "@/lib/auth-routing";

/** httpOnly token lives on the API host (Render); role cookie is set on the frontend after login. */
const SESSION_COOKIES = ["estateos_token", "estateos_role"] as const;

const PROTECTED_PREFIXES = ["/dashboard", "/platform", "/residents", "/security", "/pending-kyc", "/pending-estate"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => !!request.cookies.get(name)?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !hasSession(request)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const role = request.cookies.get("estateos_role")?.value;
  const roleRedirect = redirectIfWrongRoleArea(pathname, role);
  if (roleRedirect && roleRedirect !== pathname) {
    return NextResponse.redirect(new URL(roleRedirect, request.url));
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
