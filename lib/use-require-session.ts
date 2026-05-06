"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { logoutRequest, meRequest } from "@/lib/estate-api";
import { clearSession, getStoredToken, isApiMode, setSession } from "@/lib/session";

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

  useEffect(() => {
    if (!isEnabled) {
      setReady(true);
      return;
    }
    void (async () => {
      const token = getStoredToken();
      if (!token) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      try {
        const session = await meRequest();
        const role = session.user.role as SessionRole;
        if (!allowedRoles.includes(role)) {
          setError(`This page requires ${allowedRoles.join(" or ")} access. You are signed in as ${role}.`);
          setReady(true);
          return;
        }
        setSession({
          token,
          userId: session.user.userId ?? session.user.id,
          role,
        });
        setUser(session.user as SessionUser);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Session check failed");
      } finally {
        setReady(true);
      }
    })();
  }, [allowedRoles, isEnabled, pathname, router]);

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
