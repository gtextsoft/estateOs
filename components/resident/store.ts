"use client";

import type { GuestPass, PassStatus, PassType, ResidentNotification } from "./types";
import { loadResidents } from "@/components/dashboard/residentsStore";

const PASSES_KEY = "estateos_resident_passes_v1";
const NOTIFS_KEY = "estateos_resident_notifications_v1";

// Current demo resident (Adaeze Okafor · Unit A-01)
export const CURRENT_RESIDENT_ID = "res_adaeze_okafor";

export function passTypeLabel(t: PassType) {
  if (t === "single") return "Single Entry";
  if (t === "service") return "Service Pass";
  return "Permanent";
}

export function passStatusBadgeVariant(s: PassStatus) {
  if (s === "active") return "active";
  if (s === "pending") return "pending";
  if (s === "used") return "used";
  return "revoked";
}

export function seedPasses(): GuestPass[] {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const day = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  // Use multiple residents so Host column is populated
  const residentIds = loadResidents().map((r) => r.id);
  const pickResident = (idx: number) => residentIds[idx % residentIds.length] || CURRENT_RESIDENT_ID;

  const base: Array<Omit<GuestPass, "code">> = [
    {
      id: "GPA-001",
      residentId: pickResident(0),
      guestName: "Kelechi Nwosu",
      passType: "single",
      validUntilLabel: "Today, 11:59 PM",
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
      date: iso(today),
    },
    {
      id: "GPA-002",
      residentId: pickResident(0),
      guestName: "MainFix Plumber",
      passType: "service",
      validUntilLabel: "Today 09:00 AM – 5:00 PM",
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      date: iso(today),
      timeStart: "09:00",
      timeEnd: "17:00",
    },
    {
      id: "GPA-003",
      residentId: pickResident(0),
      guestName: "Tunde (Family)",
      passType: "permanent",
      validUntilLabel: "No expiry",
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
      id: "GPA-004",
      residentId: pickResident(1),
      guestName: "Cleaner Service Team",
      passType: "service",
      validUntilLabel: `${day(1).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} 10:00 – 14:00`,
      status: "pending",
      createdAt: Date.now() - 1000 * 60 * 25,
      date: iso(day(1)),
      timeStart: "10:00",
      timeEnd: "14:00",
    },
    {
      id: "GPA-005",
      residentId: pickResident(2),
      guestName: "Ada & Chidi (Guests)",
      passType: "single",
      validUntilLabel: `${day(2).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}, 11:59 PM`,
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      date: iso(day(2)),
    },
    {
      id: "GPA-006",
      residentId: pickResident(3),
      guestName: "Parcel Delivery",
      passType: "single",
      validUntilLabel: `${day(0).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}, 11:59 PM`,
      status: "used",
      createdAt: Date.now() - 1000 * 60 * 60 * 30,
      date: iso(day(0)),
    },
    {
      id: "GPA-007",
      residentId: pickResident(4),
      guestName: "Electrician (PowerFix)",
      passType: "service",
      validUntilLabel: `${day(3).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} 09:00 – 16:00`,
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      date: iso(day(3)),
      timeStart: "09:00",
      timeEnd: "16:00",
    },
    {
      id: "GPA-008",
      residentId: pickResident(5),
      guestName: "Family Visit",
      passType: "single",
      validUntilLabel: `${day(4).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}, 11:59 PM`,
      status: "revoked",
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      date: iso(day(4)),
    },
    {
      id: "GPA-009",
      residentId: pickResident(0),
      guestName: "Gardener",
      passType: "service",
      validUntilLabel: `${day(5).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} 08:00 – 12:00`,
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 15,
      date: iso(day(5)),
      timeStart: "08:00",
      timeEnd: "12:00",
    },
    {
      id: "GPA-010",
      residentId: pickResident(2),
      guestName: "Baby Sitter",
      passType: "service",
      validUntilLabel: `${day(0).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} 18:00 – 22:00`,
      status: "active",
      createdAt: Date.now() - 1000 * 60 * 60 * 10,
      date: iso(day(0)),
      timeStart: "18:00",
      timeEnd: "22:00",
    },
  ];

  return base.map((p) => ({
    ...p,
    code: p.id,
  }));
}

export function seedNotifications(): ResidentNotification[] {
  return [
    {
      id: "N-001",
      residentId: CURRENT_RESIDENT_ID,
      message: "Your guest Kelechi Nwosu has arrived at Main Gate",
      timeLabel: "9 mins ago",
      type: "arrival",
      read: false,
    },
    {
      id: "N-002",
      residentId: CURRENT_RESIDENT_ID,
      message: "MainFix Plumber has been verified and granted entry",
      timeLabel: "1 hr ago",
      type: "service",
      read: false,
    },
    {
      id: "N-003",
      residentId: CURRENT_RESIDENT_ID,
      message: "Service charge of ₦15,000 due on March 31",
      timeLabel: "2 hrs ago",
      type: "payment",
      read: true,
    },
    {
      id: "N-004",
      residentId: CURRENT_RESIDENT_ID,
      message: "Estate general meeting scheduled for March 25",
      timeLabel: "1 day ago",
      type: "notice",
      read: true,
    },
  ];
}

export function loadPasses(): GuestPass[] {
  try {
    const raw = localStorage.getItem(PASSES_KEY);
    if (!raw) {
      const seeded = seedPasses();
      localStorage.setItem(PASSES_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Array<Partial<GuestPass>>;
    const arr = Array.isArray(parsed) ? parsed : seedPasses();

    const residentIds = new Set(loadResidents().map((r) => r.id));
    // migrate older stored passes that didn't include residentId + ensure host exists
    const migrated = arr.map((p) => {
      const rid = p.residentId || CURRENT_RESIDENT_ID;
      return {
        ...p,
        residentId: residentIds.has(rid) ? rid : CURRENT_RESIDENT_ID,
        code: (p.code || p.id || "").toString(),
      };
    }) as GuestPass[];

    localStorage.setItem(PASSES_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return seedPasses();
  }
}

export function savePasses(passes: GuestPass[]) {
  localStorage.setItem(PASSES_KEY, JSON.stringify(passes));
}

export function loadNotifications(): ResidentNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFS_KEY);
    if (!raw) {
      const seeded = seedNotifications();
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as ResidentNotification[];
    if (!Array.isArray(parsed)) return seedNotifications();

    // Migration: older notifications didn't include residentId.
    const migrated = parsed.map((n) => ({
      ...n,
      residentId: (n as any).residentId || CURRENT_RESIDENT_ID,
    }));
    return migrated;
  } catch {
    return seedNotifications();
  }
}

export function saveNotifications(notifs: ResidentNotification[]) {
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
}

export function pushResidentNotification({
  residentId,
  type,
  message,
  meta,
}: {
  residentId: string;
  type: ResidentNotification["type"];
  message: string;
  meta?: ResidentNotification["meta"];
}) {
  const notifs = loadNotifications();
  const id = `N-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const n: ResidentNotification = {
    id,
    residentId,
    message,
    timeLabel: "Just now",
    read: false,
    type,
    ...(meta ? { meta } : {}),
  };
  const next = [n, ...notifs].slice(0, 200);
  saveNotifications(next);
  return n;
}

export function revokePassesForResident(residentId: string) {
  const passes = loadPasses();
  const next = passes.map((p) =>
    p.residentId === residentId ? { ...p, status: "revoked" as const } : p,
  );
  savePasses(next);
  return next;
}

