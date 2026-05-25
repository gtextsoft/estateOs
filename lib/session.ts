"use client";

/** Demo resident id used when the app runs in local-only (no API) mode. */
export const LOCAL_DEMO_RESIDENT_ID = "res_adaeze_okafor";

const USER_ID_KEY = "estateos_user_id";
const ROLE_KEY = "estateos_role_client";
const RESIDENT_ID_KEY = "estateos_resident_mongo_id";

/**
 * Cookie-first SPA: auth is the httpOnly `estateos_token` cookie (+ CSRF cookie).
 * Client stores only non-secret routing hints (user id, role, resident id).
 */

export function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

export function isApiMode(): boolean {
  return !!getApiBase();
}

/** Production builds can require API URL so demo bypass is disabled. */
export function requireApiInProduction(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_API === "true" || process.env.NODE_ENV === "production";
}

/** @deprecated Token is not stored client-side; returns null. Kept for gradual migration. */
export function getStoredToken(): string | null {
  return null;
}

export function setSession(input: { userId: string; role: string; residentId?: string; token?: string }) {
  void input.token;
  sessionStorage.setItem(USER_ID_KEY, input.userId);
  sessionStorage.setItem(ROLE_KEY, input.role);
  if (input.residentId) sessionStorage.setItem(RESIDENT_ID_KEY, input.residentId);
  else sessionStorage.removeItem(RESIDENT_ID_KEY);
}

export function clearSession() {
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(RESIDENT_ID_KEY);
}

export function getCurrentUserId(): string {
  if (typeof window === "undefined") return LOCAL_DEMO_RESIDENT_ID;
  if (isApiMode()) {
    const id = sessionStorage.getItem(USER_ID_KEY);
    if (id) return id;
  }
  return LOCAL_DEMO_RESIDENT_ID;
}

export function getCurrentResidentId(): string {
  if (typeof window === "undefined") return LOCAL_DEMO_RESIDENT_ID;
  if (isApiMode()) {
    const rid = sessionStorage.getItem(RESIDENT_ID_KEY);
    if (rid) return rid;
  }
  return getCurrentUserId();
}

export function getClientRole(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ROLE_KEY);
}
