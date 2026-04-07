"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, QrCode, Siren } from "lucide-react";
import { loadEmergencyAlerts } from "@/components/dashboard/emergencyStore";
import { loadSecurityEvents, loadSecurityPresence } from "@/components/dashboard/securityStore";

export default function SecurityOverviewPage() {
  const [eventsCount, setEventsCount] = useState(0);
  const [insideNow, setInsideNow] = useState(0);
  const [activeEmergencies, setActiveEmergencies] = useState(0);

  const sync = () => {
    const events = loadSecurityEvents();
    const presence = loadSecurityPresence();
    const alerts = loadEmergencyAlerts();
    setEventsCount(events.length);
    setInsideNow(Object.values(presence).filter((p) => p?.inside).length);
    setActiveEmergencies(alerts.filter((a) => a.status === "active").length);
  };

  useEffect(() => {
    sync();
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "estateos_security_events_v1" ||
        e.key === "estateos_security_presence_v1" ||
        e.key === "estateos_emergency_alerts_v1"
      ) {
        sync();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const cards = useMemo(
    () => [
      { label: "Inside now", value: insideNow, icon: QrCode, href: "/security/scanner" },
      { label: "Total events", value: eventsCount, icon: AlertTriangle, href: "/security/events" },
      { label: "Active emergencies", value: activeEmergencies, icon: Siren, href: "/security/emergencies" },
    ],
    [insideNow, eventsCount, activeEmergencies],
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {activeEmergencies > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
            {activeEmergencies} active emergency alert{activeEmergencies === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-foreground mt-1">Immediate response required.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="bg-card rounded-xl border border-border p-4 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground mt-2">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
