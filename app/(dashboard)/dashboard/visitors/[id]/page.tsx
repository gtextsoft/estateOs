"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, QrCode } from "lucide-react";
import type { GuestPass } from "@/components/resident/types";
import { loadPasses, passTypeLabel } from "@/components/resident/store";

export default function VisitorDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const [passes, setPasses] = useState<GuestPass[]>([]);

  useEffect(() => {
    setPasses(loadPasses());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "estateos_resident_passes_v1") setPasses(loadPasses());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const p = useMemo(() => passes.find((x) => x.id === id), [passes, id]);

  if (!p) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-foreground">Visitor not found</h1>
        <p className="text-sm text-muted-foreground">This guest pass does not exist.</p>
        <Link href="/dashboard/visitors" className="text-sm font-medium text-primary hover:underline">
          Back to Visitor Access
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{p.guestName}</h1>
          <p className="text-sm text-muted-foreground">Guest pass details and access history.</p>
        </div>
        <Link href="/dashboard/visitors" className="text-sm font-medium text-primary hover:underline">
          Back
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{passTypeLabel(p.passType)}</p>
            <p className="text-xs text-muted-foreground">Status: {p.status}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Host</p>
            <p className="font-medium text-foreground">Adaeze Okafor (A-01)</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
            <p className="font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> {p.validUntilLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft">
        <div className="p-5 border-b border-border">
          <h3 className="font-display text-lg font-semibold text-foreground">Recent Access Logs</h3>
          <p className="text-sm text-muted-foreground">Sample logs (wire to API later).</p>
        </div>
        <div className="divide-y divide-border">
          {[
            { time: "14:32", gate: "North Gate", action: "granted" },
            { time: "14:15", gate: "South Gate", action: "exit" },
          ].map((l, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {l.gate} · {l.action}
                </p>
                <p className="text-xs text-muted-foreground">{l.time}</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {l.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

