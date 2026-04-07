"use client";

export type EmergencyAlert = {
  id: string;
  residentId: string;
  residentName: string;
  unit: string;
  message: string;
  createdAt: number;
  status: "active" | "acknowledged";
};

const EMERGENCY_ALERTS_KEY = "estateos_emergency_alerts_v1";

export function loadEmergencyAlerts(): EmergencyAlert[] {
  try {
    const raw = localStorage.getItem(EMERGENCY_ALERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EmergencyAlert[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEmergencyAlerts(alerts: EmergencyAlert[]) {
  localStorage.setItem(EMERGENCY_ALERTS_KEY, JSON.stringify(alerts));
}

export function pushEmergencyAlert(input: {
  residentId: string;
  residentName: string;
  unit: string;
  message: string;
}) {
  const alerts = loadEmergencyAlerts();
  const next: EmergencyAlert = {
    id: `emg_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    residentId: input.residentId,
    residentName: input.residentName,
    unit: input.unit,
    message: input.message.trim(),
    createdAt: Date.now(),
    status: "active",
  };
  const merged = [next, ...alerts].slice(0, 300);
  saveEmergencyAlerts(merged);
  return next;
}

export function getLatestActiveEmergencyAlert() {
  return loadEmergencyAlerts().find((a) => a.status === "active") ?? null;
}

export function acknowledgeEmergencyAlert(id: string) {
  const alerts = loadEmergencyAlerts();
  const next = alerts.map((a) =>
    a.id === id ? { ...a, status: "acknowledged" as const } : a,
  );
  saveEmergencyAlerts(next);
}

export function alertsForResident(residentId: string) {
  return loadEmergencyAlerts()
    .filter((a) => a.residentId === residentId)
    .sort((a, b) => b.createdAt - a.createdAt);
}
