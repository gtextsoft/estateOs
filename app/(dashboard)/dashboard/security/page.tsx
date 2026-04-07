"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Eye, MapPin, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  createGate,
  loadGates,
  loadGatePreset,
  loadSecurityEvents,
  loadSecurityPresence,
  processSecurityScan,
  saveGatePreset,
  type SecurityEventRecord,
  type SecurityGateId,
  type SecurityGate,
  type SecurityGateStatus,
  type SecurityPresenceRecord,
} from "@/components/dashboard/securityStore";
import { loadPasses, passTypeLabel } from "@/components/resident/store";
import { loadResidents, type ResidentRecord } from "@/components/dashboard/residentsStore";
import type { GuestPass } from "@/components/resident/types";
import { acknowledgeEmergencyAlert, loadEmergencyAlerts, type EmergencyAlert } from "@/components/dashboard/emergencyStore";

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dotClass(type: SecurityEventRecord["type"]) {
  switch (type) {
    case "entry":
      return "bg-emerald-500";
    case "exit":
      return "bg-muted-foreground";
    case "access_denied":
      return "bg-destructive";
    case "patrol":
      return "bg-primary";
    case "system":
      return "bg-primary";
  }
}

export default function SecurityPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [gates, setGates] = useState<SecurityGate[]>([]);
  const [gateId, setGateId] = useState<SecurityGateId>("north");
  const [events, setEvents] = useState<SecurityEventRecord[]>([]);
  const [presence, setPresence] = useState<Record<string, SecurityPresenceRecord>>({});
  const [passes, setPasses] = useState<GuestPass[]>([]);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [scanCode, setScanCode] = useState("");
  const [lastScan, setLastScan] = useState<{ ok: boolean; event: SecurityEventRecord } | null>(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | SecurityEventRecord["type"]>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEventRecord | null>(null);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyAlert | null>(null);

  const [createGateName, setCreateGateName] = useState("");
  const [createGateStatus, setCreateGateStatus] = useState<SecurityGateStatus>("Active");
  const [creatingGate, setCreatingGate] = useState(false);

  const didAutoScanRef = useRef(false);

  const refresh = () => {
    setGates(loadGates());
    const nextEvents = loadSecurityEvents();
    const nextPresenceRaw = loadSecurityPresence();
    setEvents(nextEvents);
    setPresence(nextPresenceRaw);
    setPasses(loadPasses());
    setResidents(loadResidents());
    setEmergencyAlerts(loadEmergencyAlerts().sort((a, b) => b.createdAt - a.createdAt));
  };

  useEffect(() => {
    const loaded = loadGates();
    const preset = loadGatePreset();
    const nextGateId = loaded.some((g) => g.id === preset) ? preset : loaded[0]?.id ?? "north";
    setGateId(nextGateId);
    refresh();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "estateos_emergency_alerts_v1" ||
        e.key === "estateos_security_events_v1" ||
        e.key === "estateos_security_presence_v1"
      ) {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;
    if (!gates.length) return;
    if (didAutoScanRef.current) return;

    didAutoScanRef.current = true;

    const subjectCode = code.toString();
    const result = processSecurityScan({ subjectCode, gateId, action: "auto" });
    setLastScan(result);
    refresh();

    // Prevent re-processing on refresh. QR scanning will still call this page with params again.
    router.replace("/dashboard/security");
  }, [gateId, searchParams, router, gates.length]);

  const insideCountByGate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of gates) counts[g.id] = 0;
    for (const p of Object.values(presence)) {
      if (!p?.inside) continue;
      const g = p.lastEntryGateId ?? p.lastGateId;
      if (g) counts[g] = (counts[g] ?? 0) + 1;
    }
    return counts;
  }, [presence, gates]);

  const gateList = gates.length ? gates : loadGates();

  useEffect(() => {
    setPage(1);
    setSelectedEvent(null);
  }, [gateId, query, typeFilter, pageSize]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Security Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Scan QR codes at the gate to create realistic entry/exit logs (stored locally).
          </p>
        </div>

        <div className="w-full sm:w-[420px] rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Create gate</p>
          <div className="mt-3 flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1">
              <Input
                value={createGateName}
                onChange={(e) => setCreateGateName(e.target.value)}
                placeholder="Gate name (e.g. East Gate)"
              />
            </div>
            <Select
              value={createGateStatus}
              onChange={(e) => setCreateGateStatus(e.target.value as SecurityGateStatus)}
            >
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
            </Select>
            <Button
              className="bg-gradient-gold shadow-gold hover:opacity-90"
              disabled={creatingGate || !createGateName.trim()}
              onClick={() => {
                const name = createGateName.trim();
                if (!name) return;
                setCreatingGate(true);
                try {
                  const g = createGate({ name, status: createGateStatus });
                  setCreateGateName("");
                  setCreateGateStatus("Active");
                  setGateId(g.id);
                  saveGatePreset(g.id);
                  refresh();
                } finally {
                  setCreatingGate(false);
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Create
            </Button>
          </div>
        </div>
      </div>

      {lastScan && (
        <div
          className={`rounded-xl border px-4 py-3 ${
            lastScan.ok ? "border-emerald-200 bg-emerald-50/30 text-emerald-900" : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
          role="status"
        >
          <div className="font-medium">
            {lastScan.ok ? "Scan approved" : "Scan denied"} — {lastScan.event.message}
          </div>
          <div className="text-xs opacity-70 mt-1">
            {timeLabel(lastScan.event.time)} · {lastScan.event.gateName}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-4 gap-4">
        {(() => {
          const totalInside = Object.values(presence).filter((p) => p?.inside).length;
          const entries = events.filter((e) => e.type === "entry").length;
          const exits = events.filter((e) => e.type === "exit").length;
          const denied = events.filter((e) => e.type === "access_denied").length;
          return (
            <>
              <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                <div className="text-xs text-muted-foreground">Inside now</div>
                <div className="font-display text-2xl font-bold text-foreground mt-1">{totalInside}</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                <div className="text-xs text-muted-foreground">Entries</div>
                <div className="font-display text-2xl font-bold text-foreground mt-1">{entries}</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                <div className="text-xs text-muted-foreground">Exits</div>
                <div className="font-display text-2xl font-bold text-foreground mt-1">{exits}</div>
              </div>
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 shadow-soft">
                <div className="text-xs text-destructive font-semibold uppercase tracking-wider">
                  Access denied
                </div>
                <div className="font-display text-2xl font-bold text-destructive mt-1">{denied}</div>
              </div>
            </>
          );
        })()}
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Emergency alerts</h3>
            <p className="text-sm text-muted-foreground">
              {emergencyAlerts.length} total · {emergencyAlerts.filter((a) => a.status === "active").length} active
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Time</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Resident</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {emergencyAlerts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No emergency alerts yet.
                  </td>
                </tr>
              ) : (
                emergencyAlerts.slice(0, 30).map((a) => (
                  <tr
                    key={a.id}
                    className="cursor-pointer hover:bg-muted/60 border-b border-border/40"
                    onClick={() => setSelectedEmergency(a)}
                  >
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-foreground">{a.residentName}</div>
                      <div className="text-xs text-muted-foreground">Unit {a.unit}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={a.status === "active" ? "revoked" : "active"} className="px-2 py-1 rounded-md text-xs">
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[520px]">
                      <span className="block truncate">{a.message}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Gate</span>
            <Select
              value={gateId}
              onChange={(e) => {
                const next = e.target.value as SecurityGateId;
                setGateId(next);
                saveGatePreset(next);
              }}
            >
              {gateList.map((g) => {
                const inside = insideCountByGate[g.id] ?? 0;
                return (
                  <option key={g.id} value={g.id}>
                    {g.name} ({inside})
                  </option>
                );
              })}
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Input
                placeholder="Filter by code, subject, message..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="entry">Entry</option>
              <option value="exit">Exit</option>
              <option value="access_denied">Denied</option>
              <option value="system">System</option>
              <option value="patrol">Patrol</option>
            </Select>
          </div>
        </div>

        {(() => {
          const filtered = events.filter((e) => {
            if (e.gateId !== gateId) return false;
            if (typeFilter !== "all" && e.type !== typeFilter) return false;

            const q = query.trim().toLowerCase();
            if (!q) return true;
            const subject = `${e.subjectName ?? ""} ${e.subjectCode ?? ""}`.toLowerCase();
            return (
              subject.includes(q) ||
              (e.message ?? "").toLowerCase().includes(q) ||
              (e.guestPassId ?? "").toLowerCase().includes(q) ||
              (e.residentId ?? "").toLowerCase().includes(q)
            );
          });

          const count = filtered.length;
          const pageCount = Math.max(1, Math.ceil(count / pageSize));
          const safePage = Math.min(Math.max(1, page), pageCount);
          const start = (safePage - 1) * pageSize;
          const pageRows = filtered.slice(start, start + pageSize);

          return (
            <>
              <div className="mt-6 overflow-hidden rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                        Time
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                        Subject
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                        Action
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                        Result
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-sm text-muted-foreground"
                        >
                          No scans found.
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((ev) => {
                        const resultBadge =
                          ev.type === "access_denied" ? (
                            <Badge variant="revoked" className="px-2 py-1 rounded-md text-xs">
                              Denied
                            </Badge>
                          ) : (
                            <Badge variant="active" className="px-2 py-1 rounded-md text-xs">
                              Approved
                            </Badge>
                          );

                        return (
                          <tr
                            key={ev.id}
                            className="cursor-pointer hover:bg-muted/60 border-b border-border/40"
                            onClick={() => setSelectedEvent(ev)}
                          >
                            <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(ev.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-foreground">
                                {ev.subjectName ?? (ev.subjectType === "unknown" ? "Unknown code" : "—")}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono break-all">
                                {ev.subjectCode}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                              {ev.type === "entry"
                                ? "Entry"
                                : ev.type === "exit"
                                  ? "Exit"
                                  : ev.type === "access_denied"
                                    ? "Denied"
                                    : ev.type}
                            </td>
                            <td className="px-4 py-3">{resultBadge}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground max-w-[520px]">
                              <span className="block truncate">{ev.message}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap mt-4">
                <div className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">{pageRows.length}</span> of{" "}
                  <span className="font-medium text-foreground">{count}</span> scans
                </div>

                <Button type="button" variant="outline" size="sm" onClick={() => setPageSize((s) => (s === 10 ? 25 : 10))}>
                  View more
                </Button>
              </div>

              <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
            </>
          );
        })()}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border shadow-soft">
          <div className="p-5 border-b border-border flex items-center justify-between gap-4 flex-wrap">
            <h3 className="font-display text-lg font-semibold text-foreground">Scanner console</h3>
            <span className="text-xs text-muted-foreground">
              Scanner gate:{" "}
              <span className="font-medium text-foreground">
                {gateList.find((g) => g.id === gateId)?.name ?? "—"}
              </span>
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Scan / enter code
              </label>
              <Input value={scanCode} onChange={(e) => setScanCode(e.target.value)} placeholder="Visitor code or Resident code" />
            </div>

            <div className="grid sm:grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!scanCode.trim()) return;
                  const result = processSecurityScan({
                    subjectCode: scanCode,
                    gateId,
                    action: "auto",
                  });
                  setLastScan(result);
                  refresh();
                  setScanCode("");
                }}
              >
                Auto (Entry/Exit)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!scanCode.trim()) return;
                  const result = processSecurityScan({
                    subjectCode: scanCode,
                    gateId,
                    action: "entry",
                  });
                  setLastScan(result);
                  refresh();
                  setScanCode("");
                }}
              >
                Force Entry
              </Button>
              <Button
                type="button"
                className="bg-destructive text-destructive-foreground"
                onClick={() => {
                  if (!scanCode.trim()) return;
                  const result = processSecurityScan({
                    subjectCode: scanCode,
                    gateId,
                    action: "exit",
                  });
                  setLastScan(result);
                  refresh();
                  setScanCode("");
                }}
              >
                Force Exit
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">QR behavior</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    QR codes open <span className="font-mono">/dashboard/security?code=...</span>. This page records
                    entry or exit automatically based on presence (inside/outside).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-soft">
          <div className="p-5 border-b border-border">
            <h3 className="font-display text-lg font-semibold text-foreground">Recent scans</h3>
          </div>

          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No scans yet.</div>
            ) : (
              events.slice(0, 15).map((ev) => (
                <div
                  key={ev.id}
                  className="px-5 py-3 flex items-start gap-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEvent(ev)}
                >
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${dotClass(ev.type)}`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{ev.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeLabel(ev.time)} · {ev.gateName}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Security detail">
        {selectedEvent && (() => {
          const ev = selectedEvent;
          const presenceRec = presence[ev.subjectCode];
          const pass = ev.guestPassId
            ? passes.find((p) => p.id === ev.guestPassId) ?? null
            : passes.find((p) => p.code === ev.subjectCode) ?? null;
          const host = pass ? residents.find((r) => r.id === pass.residentId) ?? null : null;
          const resident =
            ev.residentId
              ? residents.find((r) => r.id === ev.residentId) ?? null
              : ev.subjectType === "resident"
                ? residents.find((r) => r.id === ev.subjectCode) ?? null
                : null;

          const subjectHistory = events
            .filter((x) => x.subjectCode === ev.subjectCode)
            .slice()
            .sort((a, b) => b.time - a.time)
            .slice(0, 12);

          return (
            <div className="space-y-4">
              <div className="bg-background rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{ev.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeLabel(ev.time)} · {ev.gateName}
                    </p>
                  </div>

                  {ev.type === "access_denied" ? (
                    <Badge variant="revoked" className="px-3 py-1 rounded-full">
                      Denied
                    </Badge>
                  ) : (
                    <Badge variant="active" className="px-3 py-1 rounded-full">
                      Approved
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Code</p>
                  <p className="font-mono break-all">{ev.subjectCode}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subject type</p>
                  <p className="font-medium text-foreground">
                    {ev.subjectType === "guest_pass" ? "Guest pass" : ev.subjectType === "resident" ? "Resident" : "Unknown"}
                  </p>
                </div>
              </div>

              {pass && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Guest pass
                  </p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Guest</p>
                      <p className="font-medium text-foreground">{pass.guestName}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={pass.status} className="px-3 py-1 rounded-full">
                        {pass.status}
                      </Badge>
                      <Badge variant="default" className="px-3 py-1 rounded-full">
                        {passTypeLabel(pass.passType)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valid</p>
                      <p className="font-medium text-foreground">{pass.validUntilLabel}</p>
                    </div>
                    {host && (
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-xs text-muted-foreground">Host resident</p>
                          <p className="font-medium text-foreground">
                            {host.name} · Unit {host.unit}
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/residents/${host.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={() => setSelectedEvent(null)}
                        >
                          View host
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {resident && !pass && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resident</p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium text-foreground">{resident.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Unit</p>
                      <p className="font-medium text-foreground">{resident.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground break-all">{resident.email}</p>
                    </div>
                    <Link
                      href={`/dashboard/residents/${resident.id}`}
                      className="text-sm font-medium text-primary hover:underline block"
                      onClick={() => setSelectedEvent(null)}
                    >
                      View resident profile
                    </Link>
                  </div>
                </div>
              )}

              <div className="bg-muted/20 rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Presence & movement</p>

                <div className="mt-3 grid sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Currently inside</p>
                    <p className="font-medium text-foreground">{presenceRec?.inside ? "Yes" : "No"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Last entry</p>
                    <p className="font-medium text-foreground">
                      {presenceRec?.lastEntryAt ? timeLabel(presenceRec.lastEntryAt) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Gate: {presenceRec?.lastEntryGateName ?? presenceRec?.lastGateName ?? ev.gateName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Last exit</p>
                    <p className="font-medium text-foreground">
                      {presenceRec?.lastExitAt ? timeLabel(presenceRec.lastExitAt) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Gate: {presenceRec?.lastExitGateName ?? presenceRec?.lastGateName ?? ev.gateName}
                    </p>
                  </div>
                </div>
              </div>

              {subjectHistory.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject scan history</p>
                  <div className="mt-3 divide-y divide-border max-h-56 overflow-y-auto">
                    {subjectHistory.map((h) => (
                      <div key={h.id} className="px-1 py-3 flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${dotClass(h.type)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{h.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {timeLabel(h.time)} · {h.gateName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
      <Modal isOpen={!!selectedEmergency} onClose={() => setSelectedEmergency(null)} title="Emergency alert detail">
        {selectedEmergency && (
          <div className="space-y-4">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Priority</p>
              <p className="mt-2 text-sm text-foreground">
                {selectedEmergency.residentName} (Unit {selectedEmergency.unit}) raised an emergency alert.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Resident</p>
                <p className="font-medium text-foreground mt-1">{selectedEmergency.residentName}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium text-foreground mt-1">{selectedEmergency.status}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Message</p>
              <p className="font-medium text-foreground mt-1 leading-relaxed">{selectedEmergency.message}</p>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(selectedEmergency.createdAt).toLocaleString()}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href={`/dashboard/residents/${selectedEmergency.residentId}`}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                onClick={() => setSelectedEmergency(null)}
              >
                View resident detail
              </Link>
              <Button
                onClick={() => {
                  acknowledgeEmergencyAlert(selectedEmergency.id);
                  setSelectedEmergency(null);
                  refresh();
                }}
                className="bg-gradient-gold shadow-gold hover:opacity-90"
              >
                Mark acknowledged
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

