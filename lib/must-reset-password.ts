/** Redirect target when the signed-in user must set a new password. */
export function mustResetLoginPath(next?: string | null): string {
  const base = "/login?mustReset=1";
  if (!next || !next.startsWith("/") || next.startsWith("//")) return base;
  return `${base}&next=${encodeURIComponent(next)}`;
}

export function userMustResetPassword(user: { mustResetPassword?: boolean } | null | undefined): boolean {
  return Boolean(user?.mustResetPassword);
}
