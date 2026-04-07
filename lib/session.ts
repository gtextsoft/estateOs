"use client";

/** Demo resident id used when the app runs in local-only (no API) mode. */
export const LOCAL_DEMO_RESIDENT_ID = "res_adaeze_okafor";

const TOKEN_KEY = "estateos_token";
const USER_ID_KEY = "estateos_user_id";
const ROLE_KEY = "estateos_role_client";

export function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

export function isApiMode(): boolean {
  return !!getApiBase();
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setSession(input: { token: string; userId: string; role: string }) {
  sessionStorage.setItem(TOKEN_KEY, input.token);
  sessionStorage.setItem(USER_ID_KEY, input.userId);
  sessionStorage.setItem(ROLE_KEY, input.role);
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(ROLE_KEY);
}

/** MongoDB resident id when using API login; falls back to demo id for local mode. */
export function getCurrentUserId(): string {
  if (typeof window === "undefined") return LOCAL_DEMO_RESIDENT_ID;
  if (isApiMode()) {
    const id = sessionStorage.getItem(USER_ID_KEY);
    if (id) return id;
  }
  return LOCAL_DEMO_RESIDENT_ID;
}

/** Alias for `getCurrentUserId` (resident-scoped sessions). */
export function getCurrentResidentId(): string {
  return getCurrentUserId();
}

export function getClientRole(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ROLE_KEY);
}
