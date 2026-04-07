import type { GuestPass, ResidentNotification } from "@/components/resident/types";
import type { ResidentRecord } from "@/components/dashboard/residentsStore";
import type { PaymentRecord } from "@/components/dashboard/paymentsStore";
import type {
  IncidentRecord,
  IncidentTypeCategory,
  IncidentUpdate,
} from "@/components/dashboard/incidentsStore";
import type {
  SecurityGate,
  SecurityEventRecord,
  SecurityPresenceRecord,
} from "@/components/dashboard/securityStore";
import type { EmergencyAlert } from "@/components/dashboard/emergencyStore";

import { clearSession, getApiBase, getStoredToken } from "./session";

type Json = Record<string, unknown>;

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getApiBase();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${base}/api${path}`, { ...init, credentials: "include", headers });

  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    window.location.pathname !== "/login"
  ) {
    clearSession();
    window.location.href = "/login";
  }

  return res;
}

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

function idOf(doc: { _id?: unknown }): string {
  return String(doc._id ?? "");
}

function monthYearFromDate(d: Date | string | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function mapResidentDoc(doc: Json): ResidentRecord {
  return {
    id: idOf(doc as { _id: unknown }),
    code: doc.code ? String(doc.code) : undefined,
    name: String(doc.name ?? ""),
    unit: String(doc.unit ?? ""),
    building: doc.building ? String(doc.building) : undefined,
    block: doc.block ? String(doc.block) : undefined,
    email: String(doc.email ?? ""),
    phone: doc.phone ? String(doc.phone) : undefined,
    status: doc.status as ResidentRecord["status"],
    since: monthYearFromDate(doc.createdAt as string | undefined),
  };
}

export function mapGuestPassDoc(doc: Json): GuestPass {
  const created = doc.createdAt ? new Date(doc.createdAt as string).getTime() : Date.now();
  const ridRaw = doc.residentId;
  const residentId =
    ridRaw && typeof ridRaw === "object" && "_id" in (ridRaw as object)
      ? String((ridRaw as { _id: unknown })._id)
      : String(ridRaw ?? "");
  return {
    id: idOf(doc as { _id: unknown }),
    residentId,
    code: String(doc.code ?? ""),
    guestName: String(doc.guestName ?? ""),
    passType: doc.passType as GuestPass["passType"],
    validUntilLabel: String(doc.validUntilLabel ?? ""),
    status: doc.status as GuestPass["status"],
    createdAt: created,
    date: doc.date ? String(doc.date) : undefined,
    timeStart: doc.timeStart ? String(doc.timeStart) : undefined,
    timeEnd: doc.timeEnd ? String(doc.timeEnd) : undefined,
  };
}

export function mapNotificationDoc(doc: Json): ResidentNotification {
  const t = String(doc.type ?? "notice");
  const type = ["arrival", "service", "payment", "notice", "emergency", "visitor"].includes(t)
    ? (t as ResidentNotification["type"])
    : "notice";
  return {
    id: idOf(doc as { _id: unknown }),
    residentId: String(doc.recipientId ?? ""),
    message: String(doc.message ?? ""),
    timeLabel: String(doc.timeLabel ?? "Just now"),
    read: Boolean(doc.read),
    type,
    meta: doc.meta as ResidentNotification["meta"],
  };
}

export function mapPaymentDoc(doc: Json, residentName?: string, unit?: string): PaymentRecord {
  return {
    id: idOf(doc as { _id: unknown }),
    residentId: String(doc.residentId ?? ""),
    residentName: residentName ?? "",
    unit: unit ?? "",
    amount: String(doc.amount ?? ""),
    type: String(doc.type ?? ""),
    status: doc.status as PaymentRecord["status"],
    dateLabel: String(doc.dateLabel ?? ""),
    createdAt: doc.createdAt ? new Date(doc.createdAt as string).getTime() : Date.now(),
    reference: doc.reference ? String(doc.reference) : undefined,
    notes: doc.notes ? String(doc.notes) : undefined,
  };
}

export function mapIncidentDoc(doc: Json): IncidentRecord {
  const it = doc.incidentType ? String(doc.incidentType) : "";
  const incidentType = [
    "theft",
    "dispute",
    "breach",
    "noise",
    "property_damage",
    "medical",
    "other",
  ].includes(it)
    ? (it as IncidentTypeCategory)
    : undefined;
  const att = doc.attachments;
  const attachments = Array.isArray(att)
    ? att.map((x) => String(x)).filter(Boolean)
    : undefined;
  return {
    id: idOf(doc as { _id: unknown }),
    residentId: doc.residentId ? String(doc.residentId) : undefined,
    title: String(doc.title ?? ""),
    reporter: String(doc.reporter ?? ""),
    incidentType,
    severity: doc.severity as IncidentRecord["severity"],
    status: doc.status as IncidentRecord["status"],
    timeLabel: String(doc.timeLabel ?? ""),
    createdAt: doc.createdAt ? new Date(doc.createdAt as string).getTime() : Date.now(),
    description: doc.description ? String(doc.description) : undefined,
    attachments,
    updates: [],
  };
}

export function mapIncidentUpdateDoc(doc: Json): IncidentUpdate {
  return {
    id: idOf(doc as { _id: unknown }),
    createdAt: doc.createdAt ? new Date(doc.createdAt as string).getTime() : Date.now(),
    by: String(doc.by ?? ""),
    message: String(doc.message ?? ""),
  };
}

export function mapGateDoc(doc: Json): SecurityGate {
  return {
    id: String(doc.idKey ?? doc._id ?? ""),
    name: String(doc.name ?? ""),
    status: doc.status as SecurityGate["status"],
    guards: typeof doc.guards === "number" ? doc.guards : undefined,
  };
}

export function mapSecurityEventDoc(
  doc: Json,
  gateMongoIdToIdKey?: Map<string, string>,
): SecurityEventRecord {
  const t = String(doc.type ?? "system");
  const type = ["entry", "exit", "patrol", "access_denied", "system"].includes(t)
    ? (t as SecurityEventRecord["type"])
    : "system";
  const time = doc.time ? new Date(doc.time as string).getTime() : Date.now();
  const rawGate = doc.gateId as unknown;
  const gateMongoId =
    typeof rawGate === "object" && rawGate !== null && "$oid" in (rawGate as object)
      ? String((rawGate as { $oid: string }).$oid)
      : String(rawGate ?? "");
  const gateId =
    gateMongoIdToIdKey?.get(gateMongoId) ?? gateMongoIdToIdKey?.get(String(doc.gateId)) ?? gateMongoId;
  return {
    id: idOf(doc as { _id: unknown }),
    type,
    gateId,
    gateName: String(doc.gateName ?? ""),
    time,
    subjectType: doc.subjectType as SecurityEventRecord["subjectType"],
    subjectCode: String(doc.subjectCode ?? ""),
    subjectName: doc.subjectName ? String(doc.subjectName) : undefined,
    residentId: doc.residentId ? String(doc.residentId) : undefined,
    guestPassId: doc.guestPassId ? String(doc.guestPassId) : undefined,
    action: (doc.action === "entry" || doc.action === "exit" ? doc.action : "entry") as "entry" | "exit",
    message: String(doc.message ?? ""),
  };
}

export function mapEmergencyDoc(doc: Json): EmergencyAlert {
  return {
    id: idOf(doc as { _id: unknown }),
    residentId: String(doc.residentId ?? ""),
    residentName: String(doc.residentName ?? ""),
    unit: String(doc.unit ?? ""),
    message: String(doc.message ?? ""),
    createdAt: doc.createdAt ? new Date(doc.createdAt as string).getTime() : Date.now(),
    status: doc.status as EmergencyAlert["status"],
  };
}

export function mapPresenceDoc(doc: Json, subjectCode: string): [string, SecurityPresenceRecord] {
  const rec: SecurityPresenceRecord = {
    inside: Boolean(doc.inside),
    lastEntryAt: doc.lastEntryAt ? new Date(doc.lastEntryAt as string).getTime() : undefined,
    lastExitAt: doc.lastExitAt ? new Date(doc.lastExitAt as string).getTime() : undefined,
    lastEntryGateId: doc.lastEntryGateId ? String(doc.lastEntryGateId) : undefined,
    lastEntryGateName: doc.lastEntryGateName ? String(doc.lastEntryGateName) : undefined,
    lastExitGateId: doc.lastExitGateId ? String(doc.lastExitGateId) : undefined,
    lastExitGateName: doc.lastExitGateName ? String(doc.lastExitGateName) : undefined,
    lastGateId: doc.lastGateId ? String(doc.lastGateId) : undefined,
    lastGateName: doc.lastGateName ? String(doc.lastGateName) : undefined,
    subjectType: doc.subjectType as SecurityPresenceRecord["subjectType"],
    subjectName: doc.subjectName ? String(doc.subjectName) : undefined,
    residentId: doc.residentId ? String(doc.residentId) : undefined,
    guestPassId: doc.guestPassId ? String(doc.guestPassId) : undefined,
  };
  return [subjectCode, rec];
}

// ——— Auth ———

export async function loginRequest(body: {
  role: "resident" | "guard" | "manager";
  residentCode?: string;
}) {
  const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) });
  return readJson<{ ok: boolean; token: string; userId: string; role: string }>(res);
}

export async function logoutRequest() {
  const res = await apiFetch("/auth/logout", { method: "POST" });
  return readJson<{ ok: boolean }>(res);
}

export async function meRequest() {
  const res = await apiFetch("/auth/me");
  return readJson<{ ok: boolean; user: { id: string; role: string } }>(res);
}

// ——— Resident (/me) ———

export async function fetchMyProfile() {
  const res = await apiFetch("/me/profile");
  const data = await readJson<{ ok: boolean; resident: Json }>(res);
  return mapResidentDoc(data.resident);
}

export async function fetchMyGuestPasses() {
  const res = await apiFetch("/me/guest-passes");
  const data = await readJson<{ ok: boolean; passes: Json[] }>(res);
  return data.passes.map(mapGuestPassDoc);
}

export async function createGuestPassRequest(input: {
  guestName: string;
  passType: GuestPass["passType"];
  date: string;
  timeStart?: string;
  timeEnd?: string;
}) {
  const res = await apiFetch("/me/guest-passes", { method: "POST", body: JSON.stringify(input) });
  const data = await readJson<{ ok: boolean; pass: Json }>(res);
  return mapGuestPassDoc(data.pass);
}

export async function revokeGuestPassRequest(passId: string) {
  const res = await apiFetch(`/me/guest-passes/${encodeURIComponent(passId)}/revoke`, {
    method: "PATCH",
  });
  await readJson(res);
}

export async function fetchMyIncidents() {
  const res = await apiFetch("/me/incidents");
  const data = await readJson<{ ok: boolean; incidents: Json[] }>(res);
  return data.incidents.map(mapIncidentDoc);
}

export async function createIncidentRequest(input: {
  title: string;
  severity: IncidentRecord["severity"];
  description?: string;
  incidentType?: IncidentTypeCategory;
  attachments?: string[];
}) {
  const res = await apiFetch("/me/incidents", { method: "POST", body: JSON.stringify(input) });
  const data = await readJson<{ ok: boolean; incident: Json }>(res);
  return mapIncidentDoc(data.incident);
}

export async function fetchMyPayments() {
  const prof = await fetchMyProfile().catch(() => null);
  const res = await apiFetch("/me/payments");
  const data = await readJson<{ ok: boolean; payments: Json[] }>(res);
  return data.payments.map((p) =>
    mapPaymentDoc(p, prof?.name ?? "", prof?.unit ?? ""),
  );
}

export async function createPaymentRequestApi(input: { type: string; amount: string; notes?: string }) {
  const res = await apiFetch("/me/payments", { method: "POST", body: JSON.stringify(input) });
  const data = await readJson<{ ok: boolean; payment: Json }>(res);
  const prof = await fetchMyProfile().catch(() => null);
  return mapPaymentDoc(data.payment, prof?.name ?? "", prof?.unit ?? "");
}

export async function fetchMyNotifications() {
  const res = await apiFetch("/me/notifications");
  const data = await readJson<{ ok: boolean; notifications: Json[] }>(res);
  return data.notifications.map(mapNotificationDoc);
}

export async function createEmergencyRequest(message?: string) {
  const res = await apiFetch("/emergency/me", {
    method: "POST",
    body: JSON.stringify({ message: message ?? "" }),
  });
  const data = await readJson<{ ok: boolean; alert: Json }>(res);
  return mapEmergencyDoc(data.alert);
}

// ——— Admin ———

export async function fetchAdminResidents() {
  const res = await apiFetch("/admin/residents");
  const data = await readJson<{ ok: boolean; residents: Json[] }>(res);
  return data.residents.map(mapResidentDoc);
}

export async function createAdminResident(input: {
  name: string;
  unit: string;
  email: string;
  phone?: string;
  code?: string;
  building?: string;
  block?: string;
}) {
  const res = await apiFetch("/admin/residents", { method: "POST", body: JSON.stringify(input) });
  const data = await readJson<{ ok: boolean; resident: Json }>(res);
  return mapResidentDoc(data.resident);
}

export async function fetchAdminIncidents() {
  const res = await apiFetch("/admin/incidents");
  const data = await readJson<{ ok: boolean; incidents: Json[] }>(res);
  return data.incidents.map(mapIncidentDoc);
}

export async function fetchAdminIncidentDetail(incidentId: string) {
  const res = await apiFetch(`/admin/incidents/${encodeURIComponent(incidentId)}`);
  const data = await readJson<{ ok: boolean; incident: Json; updates: Json[] }>(res);
  return {
    incident: mapIncidentDoc(data.incident),
    updates: data.updates.map(mapIncidentUpdateDoc),
  };
}

export async function patchAdminIncident(
  incidentId: string,
  body: {
    status?: string;
    message?: string;
    incidentType?: IncidentTypeCategory;
    attachments?: string[];
  },
) {
  const res = await apiFetch(`/admin/incidents/${encodeURIComponent(incidentId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const data = await readJson<{ ok: boolean; incident: Json }>(res);
  return mapIncidentDoc(data.incident);
}

export async function createAdminIncident(body: {
  title: string;
  reporter?: string;
  severity: IncidentRecord["severity"];
  status: IncidentRecord["status"];
  description?: string;
  residentId?: string;
  incidentType?: IncidentTypeCategory;
  attachments?: string[];
}) {
  const res = await apiFetch("/admin/incidents", { method: "POST", body: JSON.stringify(body) });
  const data = await readJson<{ ok: boolean; incident: Json }>(res);
  return mapIncidentDoc(data.incident);
}

export async function fetchAdminGuestPassesAll() {
  const res = await apiFetch("/admin/guest-passes");
  const data = await readJson<{ ok: boolean; passes: Json[] }>(res);
  return data.passes.map(mapGuestPassDoc);
}

export async function fetchExpectedGuestPasses(date: string) {
  const res = await apiFetch(`/admin/guest-passes/expected?date=${encodeURIComponent(date)}`);
  const data = await readJson<{ ok: boolean; date: string; passes: Json[] }>(res);
  return data.passes.map((p) => {
    const pass = mapGuestPassDoc(p);
    const ridRaw = p.residentId;
    const pop =
      ridRaw && typeof ridRaw === "object" && ridRaw !== null && "name" in ridRaw
        ? (ridRaw as { name?: string; unit?: string })
        : null;
    return {
      ...pass,
      residentName: pop?.name,
      residentUnit: pop?.unit,
    };
  });
}

export type BlacklistEntryRecord = {
  id: string;
  identifier: string;
  reason: string;
  active: boolean;
  expiresAt?: number;
};

function mapBlacklistDoc(doc: Json): BlacklistEntryRecord {
  return {
    id: idOf(doc as { _id: unknown }),
    identifier: String(doc.identifier ?? ""),
    reason: String(doc.reason ?? ""),
    active: Boolean(doc.active),
    expiresAt: doc.expiresAt ? new Date(doc.expiresAt as string).getTime() : undefined,
  };
}

export async function fetchAdminBlacklist() {
  const res = await apiFetch("/admin/blacklist");
  const data = await readJson<{ ok: boolean; blacklist: Json[] }>(res);
  return data.blacklist.map(mapBlacklistDoc);
}

export async function createAdminBlacklistEntry(input: {
  identifier: string;
  reason: string;
  expiresAt?: string | null;
}) {
  const res = await apiFetch("/admin/blacklist", { method: "POST", body: JSON.stringify(input) });
  const data = await readJson<{ ok: boolean; entry: Json }>(res);
  return mapBlacklistDoc(data.entry);
}

export async function patchAdminBlacklistEntry(
  id: string,
  body: { active?: boolean; reason?: string; expiresAt?: string | null },
) {
  const res = await apiFetch(`/admin/blacklist/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const data = await readJson<{ ok: boolean; entry: Json }>(res);
  return mapBlacklistDoc(data.entry);
}

export async function patchAdminResident(
  residentId: string,
  body: { building?: string; block?: string; unit?: string; name?: string; phone?: string },
) {
  const res = await apiFetch(`/admin/residents/${encodeURIComponent(residentId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const data = await readJson<{ ok: boolean; resident: Json }>(res);
  return mapResidentDoc(data.resident);
}

export async function createAdminGuestPass(
  residentId: string,
  input: {
    guestName: string;
    passType: GuestPass["passType"];
    date: string;
    timeStart?: string;
    timeEnd?: string;
  },
) {
  const res = await apiFetch(
    `/admin/residents/${encodeURIComponent(residentId)}/guest-passes`,
    { method: "POST", body: JSON.stringify(input) },
  );
  const data = await readJson<{ ok: boolean; pass: Json }>(res);
  return mapGuestPassDoc(data.pass);
}

export async function patchAdminGuestPass(passId: string, status: GuestPass["status"]) {
  const res = await apiFetch(`/admin/guest-passes/${encodeURIComponent(passId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  await readJson(res);
}

export async function createAdminPaymentRequest(input: {
  residentId: string;
  amount: string;
  type: string;
  notes?: string;
  status?: PaymentRecord["status"];
  dateLabel?: string;
  reference?: string;
}) {
  const res = await apiFetch("/admin/payments", { method: "POST", body: JSON.stringify(input) });
  const data = await readJson<{ ok: boolean; payment: Json }>(res);
  const residents = await fetchAdminResidents();
  const r = residents.find((x) => x.id === input.residentId);
  return mapPaymentDoc(data.payment, r?.name ?? "", r?.unit ?? "");
}

export async function patchAdminPayment(
  paymentId: string,
  body: { type?: string; status?: PaymentRecord["status"]; notes?: string },
) {
  const res = await apiFetch(`/admin/payments/${encodeURIComponent(paymentId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const data = await readJson<{ ok: boolean; payment: Json }>(res);
  const residents = await fetchAdminResidents();
  const r = residents.find((x) => x.id === String(data.payment.residentId));
  return mapPaymentDoc(data.payment, r?.name ?? "", r?.unit ?? "");
}

export async function fetchAdminPayments() {
  const res = await apiFetch("/admin/payments");
  const data = await readJson<{ ok: boolean; payments: Json[] }>(res);
  const residents = await fetchAdminResidents();
  const byId = new Map(residents.map((r) => [r.id, r]));
  return data.payments.map((p) => {
    const r = byId.get(String(p.residentId));
    return mapPaymentDoc(p, r?.name ?? "", r?.unit ?? "");
  });
}

export async function fetchAdminNotifications() {
  const res = await apiFetch("/admin/notifications");
  const data = await readJson<{ ok: boolean; notifications: Json[] }>(res);
  return data.notifications;
}

export async function markAdminNotificationsRead() {
  const res = await apiFetch("/admin/notifications/mark-all-read", { method: "PATCH" });
  await readJson(res);
}

// ——— Security ———

export async function fetchSecurityGates() {
  const res = await apiFetch("/security/gates");
  const data = await readJson<{ ok: boolean; gates: Json[] }>(res);
  return data.gates.map(mapGateDoc);
}

export async function fetchSecurityEvents(query?: { gateId?: string; q?: string; limit?: number }) {
  const gatesRes = await apiFetch("/security/gates");
  const gatesJson = await readJson<{ ok: boolean; gates: Json[] }>(gatesRes);
  const gateMongoIdToIdKey = new Map<string, string>();
  const idKeyToMongoId = new Map<string, string>();
  for (const g of gatesJson.gates) {
    const mid = idOf(g as { _id: unknown });
    const key = String((g as Json).idKey ?? "");
    gateMongoIdToIdKey.set(mid, key);
    if (key) idKeyToMongoId.set(key, mid);
  }

  const sp = new URLSearchParams();
  if (query?.gateId) {
    const mongo =
      idKeyToMongoId.get(query.gateId) ??
      (query.gateId.length === 24 ? query.gateId : undefined);
    if (mongo) sp.set("gateId", mongo);
  }
  if (query?.q) sp.set("q", query.q);
  if (query?.limit) sp.set("limit", String(query.limit));
  const qs = sp.toString();

  const res = await apiFetch(`/security/events${qs ? `?${qs}` : ""}`);
  const data = await readJson<{ ok: boolean; events: Json[] }>(res);
  return data.events.map((e) => mapSecurityEventDoc(e, gateMongoIdToIdKey));
}

export async function securityScanRequest(input: {
  rawQrPayload: string;
  gateId: string;
  action?: "entry" | "exit" | "auto";
}) {
  const gatesRes = await apiFetch("/security/gates");
  const gatesJson = await readJson<{ ok: boolean; gates: Json[] }>(gatesRes);
  const gateMongoIdToIdKey = new Map<string, string>();
  for (const g of gatesJson.gates) {
    gateMongoIdToIdKey.set(idOf(g as { _id: unknown }), String((g as Json).idKey ?? ""));
  }

  const res = await apiFetch("/security/scans", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await readJson<{ ok: boolean; event: Json }>(res);
  return { ok: data.ok, event: mapSecurityEventDoc(data.event, gateMongoIdToIdKey) };
}

export async function securityManualDenialRequest(input: {
  gateId: string;
  reason: string;
  subjectCode?: string;
}) {
  const gatesRes = await apiFetch("/security/gates");
  const gatesJson = await readJson<{ ok: boolean; gates: Json[] }>(gatesRes);
  const gateMongoIdToIdKey = new Map<string, string>();
  for (const g of gatesJson.gates) {
    gateMongoIdToIdKey.set(idOf(g as { _id: unknown }), String((g as Json).idKey ?? ""));
  }

  const res = await apiFetch("/security/manual-denials", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await readJson<{ ok: boolean; event: Json }>(res);
  return { ok: data.ok, event: mapSecurityEventDoc(data.event, gateMongoIdToIdKey) };
}

export async function fetchSecurityEmergencyAlerts() {
  const res = await apiFetch("/security/emergency-alerts");
  const data = await readJson<{ ok: boolean; alerts: Json[] }>(res);
  return data.alerts.map(mapEmergencyDoc);
}

export async function ackSecurityEmergencyAlert(id: string, acknowledgedByUserId?: string) {
  const res = await apiFetch(`/security/emergency-alerts/${encodeURIComponent(id)}/ack`, {
    method: "POST",
    body: JSON.stringify({ acknowledgedByUserId }),
  });
  const data = await readJson<{ ok: boolean; alert: Json }>(res);
  return mapEmergencyDoc(data.alert);
}

export async function fetchSecurityPresenceMap() {
  const res = await apiFetch("/security/presence");
  const data = await readJson<{ ok: boolean; presence: Json[] }>(res);
  const out: Record<string, SecurityPresenceRecord> = {};
  for (const row of data.presence) {
    const code = String((row as Json).subjectCode ?? "");
    if (!code) continue;
    const [, rec] = mapPresenceDoc(row as Json, code);
    out[code] = rec;
  }
  return out;
}

export { apiFetch };
export { isApiMode } from "./session";
