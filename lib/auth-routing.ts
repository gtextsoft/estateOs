export type AppRole = "resident" | "guard" | "manager" | "platform_admin";

/** Default landing path after login for each role and account state. */
export function routeAfterLogin(input: {
  role: string;
  kycStatus?: string;
  estateStatus?: string;
}): string {
  if (input.role === "platform_admin") return "/platform";
  if (input.role === "manager" && input.estateStatus === "pending") return "/pending-estate";
  if (
    (input.role === "resident" || input.role === "guard") &&
    input.kycStatus === "submitted"
  ) {
    return "/pending-kyc";
  }
  if (input.role === "resident") return "/residents";
  if (input.role === "guard") return "/security";
  if (input.role === "manager") return "/dashboard";
  return "/login";
}

/** Paths a role is allowed to use (prefix match). */
export function isPathAllowedForRole(pathname: string, role: string): boolean {
  if (pathname === "/pending-kyc" || pathname.startsWith("/pending-kyc/")) {
    return role === "resident" || role === "guard";
  }
  if (pathname === "/pending-estate" || pathname.startsWith("/pending-estate/")) {
    return role === "manager";
  }
  if (pathname === "/residents" || pathname.startsWith("/residents/")) {
    return role === "resident";
  }
  if (pathname === "/security" || pathname.startsWith("/security/")) {
    return role === "guard";
  }
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return role === "manager";
  }
  if (pathname === "/platform" || pathname.startsWith("/platform/")) {
    return role === "platform_admin";
  }
  return false;
}

/** Honor ?next= only when it matches the signed-in role; otherwise use role default. */
export function resolvePostLoginPath(input: {
  role: string;
  kycStatus?: string;
  estateStatus?: string;
  next?: string | null;
}): string {
  const fallback = routeAfterLogin(input);
  const next = input.next?.trim();
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  if (isPathAllowedForRole(next, input.role)) return next;
  return fallback;
}

/** If a signed-in user hits another role's area, send them to their home. */
export function redirectIfWrongRoleArea(pathname: string, role: string | undefined): string | null {
  if (!role) return null;
  if (isPathAllowedForRole(pathname, role)) return null;
  const protectedPrefixes = ["/dashboard", "/platform", "/residents", "/security", "/pending-kyc", "/pending-estate"];
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return null;
  return routeAfterLogin({ role });
}
