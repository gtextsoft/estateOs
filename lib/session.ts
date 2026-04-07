"use client";

/** Demo resident id used when the app runs in local-only (no API) mode. */
export const LOCAL_DEMO_RESIDENT_ID = "res_adaeze_okafor";

const TOKEN_KEY = "estateos_token";
const USER_ID_KEY = "estateos_user_id";
const ROLE_KEY = "estateos_role_client";
const RESIDENT_ID_KEY = "estateos_resident_mongo_id";

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

export function setSession(input: { token: string; userId: string; role: string; residentId?: string }) {
  sessionStorage.setItem(TOKEN_KEY, input.token);
  sessionStorage.setItem(USER_ID_KEY, input.userId);
  sessionStorage.setItem(ROLE_KEY, input.role);
  if (input.residentId) sessionStorage.setItem(RESIDENT_ID_KEY, input.residentId);
  else sessionStorage.removeItem(RESIDENT_ID_KEY);
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(RESIDENT_ID_KEY);
}

/** User id (JWT sub) in API mode, or legacy/demo id. */
export function getCurrentUserId(): string {
  if (typeof window === "undefined") return LOCAL_DEMO_RESIDENT_ID;
  if (isApiMode()) {
    const id = sessionStorage.getItem(USER_ID_KEY);
    if (id) return id;
  }
  return LOCAL_DEMO_RESIDENT_ID;
}

/** Resident Mongo id when set (API email login); else falls back to getCurrentUserId for legacy. */
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
