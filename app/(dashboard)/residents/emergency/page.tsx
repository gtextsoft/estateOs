"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, PhoneCall, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CURRENT_RESIDENT_ID, pushResidentNotification } from "@/components/resident/store";
import { loadResidents } from "@/components/dashboard/residentsStore";
import { alertsForResident, pushEmergencyAlert, type EmergencyAlert } from "@/components/dashboard/emergencyStore";
import { useEffect } from "react";
import { Modal } from "@/components/ui/modal";

export default function ResidentEmergencyPage() {
  const [panicHolding, setPanicHolding] = useState(false);
  const [panicSent, setPanicSent] = useState(false);
  const [panicTimer, setPanicTimer] = useState(0);
  const [message, setMessage] = useState("");
  const [myAlerts, setMyAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);

  useEffect(() => {
    const sync = () => setMyAlerts(alertsForResident(CURRENT_RESIDENT_ID));
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "estateos_emergency_alerts_v1") sync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sendEmergency = (fallback = "Panic button activated by resident.") => {
    const resident =
      loadResidents().find((r) => r.id === CURRENT_RESIDENT_ID) ?? null;
    if (!resident) return;
    const detail = message.trim() || fallback;
    pushEmergencyAlert({
      residentId: resident.id,
      residentName: resident.name,
      unit: resident.unit,
      message: detail,
    });
    pushResidentNotification({
      residentId: resident.id,
      type: "emergency",
      message: `Emergency alert sent from Unit ${resident.unit}.`,
    });
    setMyAlerts(alertsForResident(CURRENT_RESIDENT_ID));
    setPanicSent(true);
    setTimeout(() => setPanicSent(false), 2500);
  };

  const startPanic = () => {
    if (panicHolding || panicSent) return;
    setPanicHolding(true);
    setPanicTimer(0);
    let t = 0;
    const interval = window.setInterval(() => {
      t += 1;
      setPanicTimer(t);
      if (t >= 3) {
        window.clearInterval(interval);
        sendEmergency("Panic button activated (3-second hold).");
        setPanicHolding(false);
        setPanicTimer(0);
      }
    }, 1000);
  };

  const stopPanic = () => {
    if (panicSent) return;
    setPanicHolding(false);
    setPanicTimer(0);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-card rounded-xl border border-border shadow-soft p-6 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Emergency
        </p>
        <div className="text-left mb-5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Emergency message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add quick details (e.g., intruder at Block A gate, medical emergency in unit, etc.)"
            className="w-full min-h-[92px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>
        {panicSent ? (
          <div>
            <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <div className="text-sm font-semibold text-emerald-700">Alert Sent!</div>
            <div className="text-xs text-muted-foreground mt-1">Guard post notified (demo).</div>
          </div>
        ) : (
          <>
            <button
              type="button"
              className={`mx-auto h-28 w-28 rounded-full border-[3px] flex flex-col items-center justify-center transition-colors ${
                panicHolding ? "border-destructive bg-destructive/10" : "border-destructive/30 bg-destructive/5"
              }`}
              onMouseDown={startPanic}
              onMouseUp={stopPanic}
              onMouseLeave={stopPanic}
              onTouchStart={startPanic}
              onTouchEnd={stopPanic}
              aria-label="Panic button hold"
            >
              <AlertTriangle className="h-8 w-8 text-destructive" />
              {panicHolding && <div className="text-lg font-black text-destructive">{3 - panicTimer}</div>}
            </button>
            <div className="mt-3 text-sm font-semibold text-foreground">Panic Button</div>
            <div className="text-xs text-muted-foreground">
              {panicHolding ? "Keep holding..." : "Hold for 3 seconds to alert security"}
            </div>
            <div className="mt-4">
              <Button
                className="bg-gradient-gold shadow-gold hover:opacity-90"
                onClick={() => sendEmergency("Manual emergency alert sent by resident.")}
              >
                Send emergency now
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border shadow-soft p-5">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Security Desk
          </div>
          <p className="text-sm text-muted-foreground mt-2">24/7 gate and patrol support</p>
          <p className="text-sm font-medium text-foreground mt-3">+234 800 000 0001</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-soft p-5">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <PhoneCall className="h-4 w-4 text-primary" />
            Estate Hotline
          </div>
          <p className="text-sm text-muted-foreground mt-2">Emergency dispatch and help</p>
          <p className="text-sm font-medium text-foreground mt-3">+234 800 000 0002</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => window.location.assign("/support")}>
          Open Support
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft">
        <div className="p-5 border-b border-border">
          <h3 className="font-display text-lg font-semibold text-foreground">My panic history</h3>
          <p className="text-sm text-muted-foreground">{myAlerts.length} alerts submitted</p>
        </div>
        <div className="p-5">
          {myAlerts.length === 0 ? (
            <div className="text-sm text-muted-foreground">No panic alerts sent yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Time</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {myAlerts.map((a) => (
                    <tr
                      key={a.id}
                      className="border-t border-border hover:bg-muted/40 cursor-pointer"
                      onClick={() => setSelectedAlert(a)}
                    >
                      <td className="px-3 py-2 text-muted-foreground">
                        {new Date(a.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${a.status === "active" ? "bg-destructive/10 text-destructive" : "bg-emerald-100 text-emerald-700"}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-foreground truncate max-w-[520px]">{a.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!selectedAlert} onClose={() => setSelectedAlert(null)} title="Emergency detail">
        {selectedAlert && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</p>
              <p className="mt-2 text-sm text-foreground">{new Date(selectedAlert.createdAt).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
              <p className="mt-2 text-sm text-foreground">{selectedAlert.status}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</p>
              <p className="mt-2 text-sm text-foreground leading-relaxed">{selectedAlert.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
