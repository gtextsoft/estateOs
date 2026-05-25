"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, QrCode } from "lucide-react";
import type { GuestPass } from "@/components/resident/types";
import { loadPasses, passTypeLabel } from "@/components/resident/store";
import { fetchAdminGuestPassById, fetchSecurityEvents } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";
import type { SecurityEventRecord } from "@/components/dashboard/securityStore";

export default function VisitorDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const [passes, setPasses] = useState<GuestPass[]>([]);
  const [pass, setPass] = useState<GuestPass | null>(null);
  const [hostName, setHostName] = useState("");
  const [hostUnit, setHostUnit] = useState("");
  const [accessLogs, setAccessLogs] = useState<SecurityEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isApiMode()) {
          const { pass: p, residentName, residentUnit } = await fetchAdminGuestPassById(id);
          setPass(p);
          setHostName(residentName);
          setHostUnit(residentUnit);
          if (p?.code) {
            const events = await fetchSecurityEvents({ q: p.code, limit: 50 });
            setAccessLogs(
              events.filter(
                (e) => e.subjectCode?.toUpperCase() === p.code.toUpperCase() || e.guestPassId === p.id,
              ),
            );
          } else {
            setAccessLogs([]);
          }
          return;
        }
        const all = loadPasses();
        setPasses(all);
        const found = all.find((x) => x.id === id) ?? null;
        setPass(found);
        setHostName("Adaeze Okafor");
        setHostUnit("A-01");
        setAccessLogs([]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load visitor");
        setPass(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
    if (!isApiMode()) {
      const onStorage = (e: StorageEvent) => {
        if (e.key === "estateos_resident_passes_v1") {
          const all = loadPasses();
          setPasses(all);
          setPass(all.find((x) => x.id === id) ?? null);
        }
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
  }, [id]);

  const p = useMemo(() => {
    if (isApiMode()) return pass;
    return passes.find((x) => x.id === id) ?? pass;
  }, [pass, passes, id]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading visitor…</p>;
  }

  if (!p) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-foreground">Visitor not found</h1>
        <p className="text-sm text-muted-foreground">This guest pass does not exist.</p>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
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

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{passTypeLabel(p.passType)}</p>
            <p className="text-xs text-muted-foreground">Status: {p.status}</p>
            {p.code && <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.code}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Host</p>
            <p className="font-medium text-foreground">
              {hostName} ({hostUnit})
            </p>
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
          <p className="text-sm text-muted-foreground">
            {isApiMode() ? "From estate security event log." : "Sample logs (local demo)."}
          </p>
        </div>
        <div className="divide-y divide-border">
          {isApiMode() ? (
            accessLogs.length === 0 ? (
              <div className="px-5 py-6 text-sm text-muted-foreground">No access events recorded for this pass yet.</div>
            ) : (
              accessLogs.map((l) => (
                <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {l.gateName ?? l.gateId} · {l.type}
                    </p>
                    <p className="text-xs text-muted-foreground">{fmt(l.time)}</p>
                    {l.message && <p className="text-xs text-muted-foreground mt-0.5">{l.message}</p>}
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {l.type}
                  </span>
                </div>
              ))
            )
          ) : (
            [
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function fmt(ts: number) {
  return new Date(ts).toLocaleString();
}
