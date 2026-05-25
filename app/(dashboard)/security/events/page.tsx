"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  loadGates,
  loadSecurityEvents,
  type SecurityEventRecord,
  type SecurityGate,
  type SecurityGateId,
} from "@/components/dashboard/securityStore";
import { fetchSecurityEvents, fetchSecurityGates } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

function fmt(ts: number) {
  return new Date(ts).toLocaleString();
}

export default function SecurityEventsPage() {
  const [gateId, setGateId] = useState<SecurityGateId>("north");
  const [gates, setGates] = useState<SecurityGate[]>([]);
  const [events, setEvents] = useState<SecurityEventRecord[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | SecurityEventRecord["type"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncLocal = () => {
    const gs = loadGates();
    setGates(gs);
    if (!gs.some((g) => g.id === gateId)) setGateId(gs[0]?.id ?? "north");
    setEvents(loadSecurityEvents());
  };

  const syncApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gs, ev] = await Promise.all([
        fetchSecurityGates(),
        fetchSecurityEvents({ limit: 200, gateId: gateId !== "all" ? gateId : undefined, q: query || undefined }),
      ]);
      setGates(gs);
      if (gs.length && !gs.some((g) => g.id === gateId)) setGateId(gs[0]?.id as SecurityGateId);
      setEvents(ev);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load security events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isApiMode()) {
      void syncApi();
      return;
    }
    syncLocal();
    setLoading(false);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "estateos_security_events_v1" || e.key === "estateos_security_gates_v1") syncLocal();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [gateId, query]);

  const filtered = useMemo(() => {
    return events
      .filter((e) => {
        if (isApiMode() && gateId !== "all" && e.gateId !== gateId) return false;
        if (!isApiMode() && e.gateId !== gateId) return false;
        if (typeFilter !== "all" && e.type !== typeFilter) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          (e.message ?? "").toLowerCase().includes(q) ||
          (e.subjectCode ?? "").toLowerCase().includes(q) ||
          (e.subjectName ?? "").toLowerCase().includes(q)
        );
      })
      .slice(0, 100);
  }, [events, gateId, typeFilter, query]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Security events</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${filtered.length} records`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={gateId} onChange={(e) => setGateId(e.target.value as SecurityGateId)}>
              {gates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | SecurityEventRecord["type"])}
            >
              <option value="all">All</option>
              <option value="entry">Entry</option>
              <option value="exit">Exit</option>
              <option value="access_denied">Denied</option>
              <option value="system">System</option>
              <option value="patrol">Patrol</option>
            </Select>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events..." />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Subject</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.id} className="border-t border-border">
                  <td className="px-3 py-2 text-muted-foreground">{fmt(ev.time)}</td>
                  <td className="px-3 py-2 text-foreground">{ev.subjectName ?? ev.subjectCode}</td>
                  <td className="px-3 py-2">
                    <Badge variant={ev.type === "access_denied" ? "revoked" : "active"}>
                      {ev.type.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{ev.message}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    No events match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
