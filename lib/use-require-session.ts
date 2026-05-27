"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ApiHttpError, logoutRequest, meRequest } from "@/lib/estate-api";
import { mustResetLoginPath, userMustResetPassword } from "@/lib/must-reset-password";
import { clearSession, isApiMode, requireApiInProduction, setSession } from "@/lib/session";

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

  const isEnabled = useMemo(() => isApiMode(), []);
  const allowedRolesKey = useMemo(() => allowedRoles.slice().sort().join("|"), [allowedRoles]);

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
      try {
        const session = await meRequest();
        if (userMustResetPassword(session.user)) {
          router.replace(mustResetLoginPath(pathname || "/"));
          return;
        }
        const role = session.user.role as SessionRole;
        if (!allowedRoles.includes(role)) {
          setError(`This page requires ${allowedRoles.join(" or ")} access. You are signed in as ${role}.`);
          setReady(true);
          return;
        }
        setSession({
          userId: session.user.userId ?? session.user.id,
          role,
          residentId: session.user.role === "resident" ? session.user.id : undefined,
        });
        setUser(session.user as SessionUser);
      } catch (err) {
        if (err instanceof ApiHttpError && err.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
          return;
        }
        setError(
          err instanceof Error
            ? `Could not verify session right now: ${err.message}`
            : "Could not verify session right now.",
        );
      } finally {
        setReady(true);
      }
    })();
  }, [allowedRolesKey, isEnabled, pathname, router]);

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

  return { ready, error, signOut, isEnabled, user };
}
