"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ApiHttpError, logoutRequest, meRequest } from "@/lib/estate-api";
import { mustResetLoginPath, userMustResetPassword } from "@/lib/must-reset-password";
import { clearSession, getClientRole, isApiMode, requireApiInProduction, setSession } from "@/lib/session";

function hasClientRoleCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith("estateos_role="));
}

type SessionRole = "resident" | "guard" | "manager" | "platform_admin";
type SessionUser = {
  id: string;
  userId?: string;
  role: string;
  email?: string;
  name?: string;
  estate?: { name?: string; slug?: string; status?: string };
};

export function useRequireSession(allowedRoles: SessionRole[]) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const isEnabled = useMemo(() => isApiMode(), []);
  const allowedRolesKey = useMemo(() => allowedRoles.slice().sort().join("|"), [allowedRoles]);

  const verifySession = async () => {
    setError(null);
    try {
      const session = await meRequest();
      if (userMustResetPassword(session.user)) {
        router.replace(mustResetLoginPath(pathname || "/"));
        return;
      }
      const role = session.user.role as SessionRole;
      if (!allowedRoles.includes(role)) {
        setError(`This page requires ${allowedRoles.join(" or ")} access. You are signed in as ${role}.`);
        return;
      }
      setSession({
        userId: session.user.userId ?? session.user.id,
        role,
        residentId: session.user.role === "resident" ? session.user.id : undefined,
      });
      setUser(session.user as SessionUser);
    } catch (err) {
      if (err instanceof ApiHttpError && err.code === "PASSWORD_RESET_REQUIRED") {
        router.replace(mustResetLoginPath(pathname || "/"));
        return;
      }
      if (err instanceof ApiHttpError && err.status === 401) {
        if (hasClientRoleCookie() || getClientRole()) {
          setError(
            "Session could not be verified with the API. Try again — if this keeps happening, check that cookies are allowed for the API domain.",
          );
          return;
        }
        clearSession();
        document.cookie = "estateos_role=; path=/; max-age=0";
        router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      setError(
        err instanceof Error
          ? `Could not verify session right now: ${err.message}`
          : "Could not verify session right now.",
      );
    }
  };

  useEffect(() => {
    if (!isEnabled) {
      if (requireApiInProduction()) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      setReady(true);
      return;
    }
    void (async () => {
      await verifySession();
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- retryKey triggers re-verify
  }, [allowedRolesKey, isEnabled, pathname, router, retryKey]);

  const signOut = async () => {
    try {
      await logoutRequest();
    } catch {
      // no-op
    }
    clearSession();
    document.cookie = "estateos_role=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return { ready, error, signOut, isEnabled, user, retrySession: () => setRetryKey((k) => k + 1) };
}
