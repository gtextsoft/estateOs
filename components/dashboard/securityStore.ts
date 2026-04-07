"use client";

import type { GuestPass } from "@/components/resident/types";
import { loadPasses, savePasses } from "@/components/resident/store";
import { loadResidents, type ResidentRecord } from "@/components/dashboard/residentsStore";

export type SecurityGateId = string;
export type SecurityScanAction = "entry" | "exit" | "auto";

export type SecurityEventType = "entry" | "exit" | "patrol" | "access_denied" | "system";

export type SecurityGateStatus = "Active" | "Maintenance";

export type SecurityGate = {
  id: SecurityGateId;
  name: string;
  status: SecurityGateStatus;
  guards?: number;
};

export type SecurityEventRecord = {
  id: string;
  type: SecurityEventType;
  gateId: SecurityGateId;
  gateName: string;
  time: number;
  // subject identification
  subjectType: "guest_pass" | "resident" | "unknown";
  subjectCode: string;
  subjectName?: string;
  residentId?: string;
  guestPassId?: string;
  // what happened
  action: "entry" | "exit";
  message: string;
};

export type SecurityPresenceRecord = {
  inside: boolean;
  lastEntryAt?: number;
  lastExitAt?: number;
  lastEntryGateId?: SecurityGateId;
  lastEntryGateName?: string;
  lastExitGateId?: SecurityGateId;
  lastExitGateName?: string;
  lastGateId?: SecurityGateId;
  lastGateName?: string;
  subjectType: "guest_pass" | "resident" | "unknown";
  subjectName?: string;
  residentId?: string;
  guestPassId?: string;
};

const EVENTS_KEY = "estateos_security_events_v1";
const PRESENCE_KEY = "estateos_security_presence_v1";
const GATE_PRESET_KEY = "estateos_security_gate_preset_v1";

const GATES_KEY = "estateos_security_gates_v1";

export const DEFAULT_GATES: SecurityGate[] = [
  { id: "north", name: "North Gate", status: "Active", guards: 2 },
  { id: "south", name: "South Gate", status: "Active", guards: 1 },
  { id: "service", name: "Service Gate", status: "Maintenance", guards: 1 },
];

function gateSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function loadGates(): SecurityGate[] {
  if (typeof window === "undefined") return DEFAULT_GATES;
  const raw = localStorage.getItem(GATES_KEY);
  const parsed = safeJsonParse<SecurityGate[]>(raw, []);
  const list = Array.isArray(parsed) ? parsed : [];

  // Always ensure defaults exist.
  const byId = new Map<string, SecurityGate>();
  for (const g of DEFAULT_GATES) byId.set(g.id, g);
  for (const g of list) byId.set(g.id, g);
  return Array.from(byId.values());
}

export function saveGates(gates: SecurityGate[]) {
  localStorage.setItem(GATES_KEY, JSON.stringify(gates));
}

export function gateNameFromId(gateId: SecurityGateId) {
  return loadGates().find((g) => g.id === gateId)?.name ?? "Gate";
}

export function createGate({
  name,
  status = "Active",
  guards,
}: {
  name: string;
  status?: SecurityGateStatus;
  guards?: number;
}): SecurityGate {
  const gates = loadGates();
  const baseId = gateSlug(name) || "gate";
  const existingIds = new Set(gates.map((g) => g.id));
  let id = baseId;
  let i = 2;
  while (existingIds.has(id)) {
    id = `${baseId}-${i}`;
    i += 1;
  }

  const gate: SecurityGate = { id, name: name.trim(), status, guards };
  const next = [...gates, gate];
  saveGates(next.filter((g, idx, arr) => arr.findIndex((x) => x.id === g.id) === idx));
  return gate;
}

function now() {
  return Date.now();
}

function makeId(prefix: string) {
  return `${prefix}-${now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadSecurityEvents(): SecurityEventRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(EVENTS_KEY);
  const parsed = safeJsonParse<SecurityEventRecord[]>(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveSecurityEvents(events: SecurityEventRecord[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function loadSecurityPresence(): Record<string, SecurityPresenceRecord> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(PRESENCE_KEY);
  const parsed = safeJsonParse<Record<string, SecurityPresenceRecord>>(raw, {});
  return parsed && typeof parsed === "object" ? parsed : {};
}

export function saveSecurityPresence(presence: Record<string, SecurityPresenceRecord>) {
  localStorage.setItem(PRESENCE_KEY, JSON.stringify(presence));
}

export function loadGatePreset(): SecurityGateId {
  if (typeof window === "undefined") return "north";
  const raw = localStorage.getItem(GATE_PRESET_KEY);
  const v = (raw || "").toString();
  if (!v) return DEFAULT_GATES[0]?.id ?? "north";
  return v;
}

export function saveGatePreset(gateId: SecurityGateId) {
  localStorage.setItem(GATE_PRESET_KEY, gateId);
}

export function processSecurityScan({
  subjectCode,
  gateId,
  action = "auto",
}: {
  subjectCode: string;
  gateId: SecurityGateId;
  action?: SecurityScanAction;
}): { ok: boolean; event: SecurityEventRecord } {
  const code = subjectCode.trim();
  const gateName = gateNameFromId(gateId);

  // presence is what decides auto entry/exit
  const presence = loadSecurityPresence();
  const existingPresence = presence[code];
  const nextAction: "entry" | "exit" =
    action === "auto" ? (existingPresence?.inside ? "exit" : "entry") : action;

  const passes = loadPasses();
  const residents = loadResidents();

  const pass = passes.find((p) => p.code === code) ?? passes.find((p) => p.id === code);
  const resident = residents.find((r) => r.id === code);

  const subjectType = pass ? "guest_pass" : resident ? "resident" : "unknown";

  // If unknown, always deny.
  if (!pass && !resident) {
    const ev: SecurityEventRecord = {
      id: makeId("SEC"),
      type: "access_denied",
      gateId,
      gateName,
      time: now(),
      subjectType: "unknown",
      subjectCode: code,
      action: nextAction,
      message: `Access denied: Unknown code`,
    };
    const events = loadSecurityEvents();
    saveSecurityEvents([ev, ...events].slice(0, 500));
    return { ok: false, event: ev };
  }

  if (subjectType === "guest_pass" && pass) {
    // Revoked/pending are denied.
    if (nextAction === "entry" && (pass.status === "revoked" || pass.status === "pending")) {
      const ev: SecurityEventRecord = {
        id: makeId("SEC"),
        type: "access_denied",
        gateId,
        gateName,
        time: now(),
        subjectType: "guest_pass",
        subjectCode: code,
        subjectName: pass.guestName,
        residentId: pass.residentId,
        guestPassId: pass.id,
        action: "entry",
        message:
          pass.status === "revoked"
            ? `Access denied: ${pass.guestName} pass is revoked`
            : `Access denied: ${pass.guestName} pass is pending`,
      };
      const events = loadSecurityEvents();
      saveSecurityEvents([ev, ...events].slice(0, 500));
      return { ok: false, event: ev };
    }

    // If already inside, entry becomes "already inside"; exit uses the inside flag.
    if (nextAction === "entry" && existingPresence?.inside) {
      const ev: SecurityEventRecord = {
        id: makeId("SEC"),
        type: "system",
        gateId,
        gateName,
        time: now(),
        subjectType: "guest_pass",
        subjectCode: code,
        subjectName: pass.guestName,
        residentId: pass.residentId,
        guestPassId: pass.id,
        action: "entry",
        message: `${pass.guestName} already inside.`,
      };
      const events = loadSecurityEvents();
      saveSecurityEvents([ev, ...events].slice(0, 500));
      return { ok: true, event: ev };
    }

    if (nextAction === "exit" && !existingPresence?.inside) {
      const ev: SecurityEventRecord = {
        id: makeId("SEC"),
        type: "access_denied",
        gateId,
        gateName,
        time: now(),
        subjectType: "guest_pass",
        subjectCode: code,
        subjectName: pass.guestName,
        residentId: pass.residentId,
        guestPassId: pass.id,
        action: "exit",
        message: `Exit denied: ${pass.guestName} is not currently inside.`,
      };
      const events = loadSecurityEvents();
      saveSecurityEvents([ev, ...events].slice(0, 500));
      return { ok: false, event: ev };
    }

    // Update presence and (for entry) pass status.
    const nextPresence: SecurityPresenceRecord = {
      inside: nextAction === "entry",
      lastEntryAt: nextAction === "entry" ? now() : existingPresence?.lastEntryAt,
      lastExitAt: nextAction === "exit" ? now() : existingPresence?.lastExitAt,
      lastEntryGateId: nextAction === "entry" ? gateId : existingPresence?.lastEntryGateId,
      lastEntryGateName: nextAction === "entry" ? gateName : existingPresence?.lastEntryGateName,
      lastExitGateId: nextAction === "exit" ? gateId : existingPresence?.lastExitGateId,
      lastExitGateName: nextAction === "exit" ? gateName : existingPresence?.lastExitGateName,
      // Backwards compatibility for older UI
      lastGateId: gateId,
      lastGateName: gateName,
      subjectType: "guest_pass",
      subjectName: pass.guestName,
      residentId: pass.residentId,
      guestPassId: pass.id,
    };

    presence[code] = nextPresence;
    saveSecurityPresence(presence);

    if (nextAction === "entry") {
      const nextPasses = passes.map((p) => {
        if (p.id !== pass.id) return p;
        // When scanned at gate, active passes become used.
        if (p.status === "active") return { ...p, status: "used" as const };
        return p;
      });
      savePasses(nextPasses);
    }

    const ev: SecurityEventRecord = {
      id: makeId("SEC"),
      type: nextAction === "entry" ? "entry" : "exit",
      gateId,
      gateName,
      time: now(),
      subjectType: "guest_pass",
      subjectCode: code,
      subjectName: pass.guestName,
      residentId: pass.residentId,
      guestPassId: pass.id,
      action: nextAction,
      message:
        nextAction === "entry"
          ? `${pass.guestName} entered via ${gateName}`
          : `${pass.guestName} exited via ${gateName}`,
    };

    const events = loadSecurityEvents();
    saveSecurityEvents([ev, ...events].slice(0, 500));
    return { ok: true, event: ev };
  }

  if (subjectType === "resident" && resident) {
    if (nextAction === "exit" && !existingPresence?.inside) {
      const ev: SecurityEventRecord = {
        id: makeId("SEC"),
        type: "access_denied",
        gateId,
        gateName,
        time: now(),
        subjectType: "resident",
        subjectCode: code,
        subjectName: resident.name,
        residentId: resident.id,
        action: "exit",
        message: `Exit denied: ${resident.name} is not currently inside.`,
      };
      const events = loadSecurityEvents();
      saveSecurityEvents([ev, ...events].slice(0, 500));
      return { ok: false, event: ev };
    }

    if (nextAction === "entry" && existingPresence?.inside) {
      const ev: SecurityEventRecord = {
        id: makeId("SEC"),
        type: "system",
        gateId,
        gateName,
        time: now(),
        subjectType: "resident",
        subjectCode: code,
        subjectName: resident.name,
        residentId: resident.id,
        action: "entry",
        message: `${resident.name} already inside.`,
      };
      const events = loadSecurityEvents();
      saveSecurityEvents([ev, ...events].slice(0, 500));
      return { ok: true, event: ev };
    }

    const nextPresence: SecurityPresenceRecord = {
      inside: nextAction === "entry",
      lastEntryAt: nextAction === "entry" ? now() : existingPresence?.lastEntryAt,
      lastExitAt: nextAction === "exit" ? now() : existingPresence?.lastExitAt,
      lastEntryGateId: nextAction === "entry" ? gateId : existingPresence?.lastEntryGateId,
      lastEntryGateName: nextAction === "entry" ? gateName : existingPresence?.lastEntryGateName,
      lastExitGateId: nextAction === "exit" ? gateId : existingPresence?.lastExitGateId,
      lastExitGateName: nextAction === "exit" ? gateId : existingPresence?.lastExitGateName,
      // Backwards compatibility for older UI
      lastGateId: gateId,
      lastGateName: gateName,
      subjectType: "resident",
      subjectName: resident.name,
      residentId: resident.id,
    };

    presence[code] = nextPresence;
    saveSecurityPresence(presence);

    const ev: SecurityEventRecord = {
      id: makeId("SEC"),
      type: nextAction === "entry" ? "entry" : "exit",
      gateId,
      gateName,
      time: now(),
      subjectType: "resident",
      subjectCode: code,
      subjectName: resident.name,
      residentId: resident.id,
      action: nextAction,
      message:
        nextAction === "entry"
          ? `${resident.name} entered via ${gateName}`
          : `${resident.name} exited via ${gateName}`,
    };

    const events = loadSecurityEvents();
    saveSecurityEvents([ev, ...events].slice(0, 500));
    return { ok: true, event: ev };
  }

  const ev: SecurityEventRecord = {
    id: makeId("SEC"),
    type: "access_denied",
    gateId,
    gateName,
    time: now(),
    subjectType: "unknown",
    subjectCode: code,
    action: nextAction,
    message: `Access denied.`,
  };
  const events = loadSecurityEvents();
  saveSecurityEvents([ev, ...events].slice(0, 500));
  return { ok: false, event: ev };
}

