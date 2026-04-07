"use client";

export type ResidentStatus = "Active" | "Pending" | "Inactive";

export type ResidentRecord = {
  id: string;
  /** Estate-issued access code (used at gates / QR). Present when synced from API. */
  code?: string;
  name: string;
  unit: string;
  building?: string;
  block?: string;
  email: string;
  phone?: string;
  status: ResidentStatus;
  since: string;
};

const RESIDENTS_KEY = "estateos_residents_v1";

export function seedResidents(): ResidentRecord[] {
  return [
    { id: "res_adaeze_okafor", name: "Adaeze Okafor", unit: "A-01", email: "adaeze@estateos.io", status: "Active", since: "Mar 2026" },
    { id: "res_sarah_chen", name: "Sarah Chen", unit: "4B", email: "sarah@email.com", status: "Active", since: "Jan 2024" },
    { id: "res_mike_brown", name: "Mike Brown", unit: "12A", email: "mike@email.com", status: "Active", since: "Mar 2024" },
    { id: "res_david_lee", name: "David Lee", unit: "7C", email: "david@email.com", status: "Active", since: "Jun 2023" },
    { id: "res_emma_wilson", name: "Emma Wilson", unit: "1A", email: "emma@email.com", status: "Active", since: "Sep 2024" },
    { id: "res_james_obi", name: "James Obi", unit: "15D", email: "james@email.com", status: "Pending", since: "Feb 2025" },
    { id: "res_aisha_bello", name: "Aisha Bello", unit: "3F", email: "aisha@email.com", status: "Active", since: "Nov 2023" },
  ];
}

export function loadResidents(): ResidentRecord[] {
  try {
    const raw = localStorage.getItem(RESIDENTS_KEY);
    if (!raw) {
      const seeded = seedResidents();
      localStorage.setItem(RESIDENTS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as ResidentRecord[];
    const arr = Array.isArray(parsed) ? parsed : seedResidents();
    // Migration: ensure demo resident exists for passes/host linking
    const mustHave = seedResidents()[0];
    if (!arr.some((r) => r.id === mustHave.id)) {
      const next = [mustHave, ...arr];
      localStorage.setItem(RESIDENTS_KEY, JSON.stringify(next));
      return next;
    }
    return arr;
  } catch {
    return seedResidents();
  }
}

export function saveResidents(residents: ResidentRecord[]) {
  localStorage.setItem(RESIDENTS_KEY, JSON.stringify(residents));
}

export function createResidentId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  const rand = Math.random().toString(16).slice(2, 6);
  return `res_${slug || "resident"}_${rand}`;
}

