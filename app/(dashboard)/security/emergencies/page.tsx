"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { acknowledgeEmergencyAlert, loadEmergencyAlerts, type EmergencyAlert } from "@/components/dashboard/emergencyStore";

function fmt(ts: number) {
  return new Date(ts).toLocaleString();
}

export default function SecurityEmergenciesPage() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [selected, setSelected] = useState<EmergencyAlert | null>(null);

  const sync = () => setAlerts(loadEmergencyAlerts().sort((a, b) => b.createdAt - a.createdAt));

  useEffect(() => {
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "estateos_emergency_alerts_v1") sync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const activeCount = useMemo(() => alerts.filter((a) => a.status === "active").length, [alerts]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Emergency alerts</h2>
        <p className="text-sm text-muted-foreground mt-1">{alerts.length} total · {activeCount} active</p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Resident</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/40 cursor-pointer" onClick={() => setSelected(a)}>
                  <td className="px-3 py-2 text-foreground">{a.residentName} · {a.unit}</td>
                  <td className="px-3 py-2">
                    <Badge variant={a.status === "active" ? "revoked" : "active"}>{a.status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{fmt(a.createdAt)}</td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-muted-foreground">No emergency alerts yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Emergency alert detail">
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Priority</p>
              <p className="mt-2 text-sm text-foreground">{selected.residentName} (Unit {selected.unit}) raised an emergency alert.</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Message</p>
              <p className="text-sm text-foreground mt-2">{selected.message}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href={`/dashboard/residents/${selected.residentId}`}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                onClick={() => setSelected(null)}
              >
                View resident detail
              </Link>
              <Button
                className="bg-gradient-gold shadow-gold hover:opacity-90"
                onClick={() => {
                  acknowledgeEmergencyAlert(selected.id);
                  setSelected(null);
                  sync();
                }}
              >
                Acknowledge
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
