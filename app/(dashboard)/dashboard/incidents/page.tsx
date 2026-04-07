"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  loadIncidents,
  saveIncidents,
  type IncidentRecord,
  type IncidentStatus,
  type IncidentSeverity,
} from "@/components/dashboard/incidentsStore";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { loadResidents, type ResidentRecord } from "@/components/dashboard/residentsStore";
import { pushResidentNotification } from "@/components/resident/store";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<IncidentRecord | null>(null);
  const [page, setPage] = useState(1);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createReporter, setCreateReporter] = useState("Admin");
  const [createSeverity, setCreateSeverity] = useState<IncidentSeverity>("Low");
  const [createStatus, setCreateStatus] = useState<IncidentStatus>("Open");
  const [createResidentId, setCreateResidentId] = useState<string>("");
  const [createDescription, setCreateDescription] = useState("");
  const [createNotifyResident, setCreateNotifyResident] = useState(true);

  const [draftStatus, setDraftStatus] = useState<IncidentStatus>("Open");
  const [draftUpdate, setDraftUpdate] = useState("");
  const [notifyResident, setNotifyResident] = useState(false);

  useEffect(() => {
    setIncidents(loadIncidents());
    setResidents(loadResidents());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "estateos_incidents_v1") setIncidents(loadIncidents());
      if (e.key === "estateos_residents_v1") setResidents(loadResidents());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return incidents;
    return incidents.filter(
      (i) =>
        i.title.toLowerCase().includes(query) ||
        i.reporter.toLowerCase().includes(query) ||
        i.id.toLowerCase().includes(query),
    );
  }, [incidents, q]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    if (!selected) return;
    setDraftStatus(selected.status);
    setDraftUpdate("");
    setNotifyResident(Boolean(selected.residentId));
  }, [selected?.id]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Incidents</h1>
          <p className="text-sm text-muted-foreground">Track and manage estate incidents and security events.</p>
        </div>
        <Button
          className="bg-gradient-gold cursor-pointer shadow-gold hover:opacity-90"
          type="button"
          onClick={() => {
            setCreateOpen(true);
            setCreateTitle("");
            setCreateReporter("Admin");
            setCreateSeverity("Low");
            setCreateStatus("Open");
            setCreateResidentId("");
            setCreateDescription("");
            setCreateNotifyResident(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search incidents..."
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {pageRows.map((inc) => (
          <button
            key={inc.id}
            type="button"
            onClick={() => setSelected(inc)}
            className="w-full text-left cursor-pointer bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-card transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center ${
                    inc.severity === "High"
                      ? "bg-destructive/10"
                      : inc.severity === "Medium"
                        ? "bg-amber-100"
                        : "bg-muted"
                  }`}
                >
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      inc.severity === "High"
                        ? "text-destructive"
                        : inc.severity === "Medium"
                          ? "text-amber-700"
                          : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{inc.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Reported by {inc.reporter}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    inc.status === "Resolved"
                      ? "bg-emerald-100 text-emerald-700"
                      : inc.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : inc.status === "Investigating"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {inc.status}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {inc.timeLabel}
                </span>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
            No incidents found.
          </div>
        )}
      </div>

      <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Incident details">
        {selected && (
          <div className="space-y-4">
            <div className="bg-background rounded-xl border border-border p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    selected.severity === "High"
                      ? "bg-destructive/10"
                      : selected.severity === "Medium"
                        ? "bg-amber-100"
                        : "bg-muted"
                  }`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      selected.severity === "High"
                        ? "text-destructive"
                        : selected.severity === "Medium"
                          ? "text-amber-700"
                          : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-foreground">{selected.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.status} · {selected.timeLabel}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Severity</p>
                  <p className="font-medium text-foreground">{selected.severity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reporter</p>
                  <p className="font-medium text-foreground">{selected.reporter}</p>
                </div>
              </div>

              {selected.description && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Details</p>
                  <p className="text-sm text-foreground mt-1 leading-relaxed">{selected.description}</p>
                </div>
              )}
            </div>

            {selected.residentId && (
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Related resident
                </p>
                <div className="mt-2">
                  {residents.find((r) => r.id === selected.residentId) ? (
                    (() => {
                      const r = residents.find((x) => x.id === selected.residentId)!;
                      return (
                        <div>
                          <p className="font-medium text-foreground">{r.name}</p>
                          <p className="text-sm text-muted-foreground">Unit {r.unit}</p>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Action flow
              </p>

              <div className="mt-3 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Update status</p>
                  <Select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as IncidentStatus)}>
                    {(["Open", "Investigating", "In Progress", "Resolved"] as IncidentStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Notify resident</p>
                  <Button
                    type="button"
                    variant={notifyResident ? "default" : "outline"}
                    className="w-full justify-center"
                    disabled={!selected.residentId}
                    onClick={() => setNotifyResident((v) => !v)}
                  >
                    {notifyResident ? "On" : "Off"}
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Investigation update (optional)</p>
                <textarea
                  value={draftUpdate}
                  onChange={(e) => setDraftUpdate(e.target.value)}
                  placeholder="Add an admin note (e.g. patrol assigned, evidence checked, resolved...)"
                  className="w-full min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                <Button
                  type="button"
                  className="bg-gradient-gold shadow-gold hover:opacity-90"
                  onClick={() => {
                    const updateMessage =
                      draftUpdate.trim() ||
                      `Status updated to ${draftStatus} for: ${selected.title}`;

                    const updateItem = {
                      id: `incu-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
                      createdAt: Date.now(),
                      by: "Admin",
                      message: updateMessage,
                    };

                    const next = incidents.map((i) => {
                      if (i.id !== selected.id) return i;
                      return {
                        ...i,
                        status: draftStatus,
                        updates: [updateItem, ...(i.updates ?? [])],
                      };
                    });

                    saveIncidents(next);
                    setIncidents(next);

                    const updated = next.find((x) => x.id === selected.id) ?? null;
                    setSelected(updated);

                    if (notifyResident && selected.residentId) {
                      pushResidentNotification({
                        residentId: selected.residentId,
                        type: "notice",
                        message: `Incident update: ${selected.title}\nStatus: ${draftStatus}`,
                        meta: { incidentId: selected.id, incidentStatus: draftStatus },
                      });
                    }

                    setDraftUpdate("");
                  }}
                >
                  Apply update
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Updates timeline
              </p>
              <div className="mt-3 divide-y divide-border max-h-56 overflow-y-auto">
                {(selected.updates ?? []).length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">No updates yet.</div>
                ) : (
                  (selected.updates ?? [])
                    .slice(0, 10)
                    .map((u) => (
                      <div key={u.id} className="py-3">
                        <p className="text-sm font-medium text-foreground">{u.by}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(u.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{u.message}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={createOpen}
        onClose={() => {
          if (creating) return;
          setCreateOpen(false);
        }}
        title="Report incident"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Title
            </label>
            <Input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder="e.g. North Gate barrier stuck" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Severity
              </label>
              <Select value={createSeverity} onChange={(e) => setCreateSeverity(e.target.value as IncidentSeverity)}>
                {(["Low", "Medium", "High"] as IncidentSeverity[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Status
              </label>
              <Select value={createStatus} onChange={(e) => setCreateStatus(e.target.value as IncidentStatus)}>
                {(["Open", "Investigating", "In Progress", "Resolved"] as IncidentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Reporter
              </label>
              <Input value={createReporter} onChange={(e) => setCreateReporter(e.target.value)} placeholder="e.g. Guard - North Gate" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Related resident (optional)
              </label>
              <Select
                value={createResidentId}
                onChange={(e) => setCreateResidentId(e.target.value)}
              >
                <option value="">None</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} · Unit {r.unit}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Add incident details for investigation..."
              className="w-full min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Notify the related resident with a status update.
                </p>
              </div>
              <Button
                type="button"
                variant={createNotifyResident ? "default" : "outline"}
                disabled={!createResidentId}
                onClick={() => setCreateNotifyResident((v) => !v)}
              >
                {createNotifyResident ? "On" : "Off"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-gradient-gold shadow-gold hover:opacity-90"
              disabled={creating || createTitle.trim().length < 3}
              onClick={() => {
                const title = createTitle.trim();
                if (title.length < 3) return;

                setCreating(true);
                try {
                  const id = `inc_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
                  const nowTs = Date.now();
                  const next: IncidentRecord = {
                    id,
                    residentId: createResidentId || undefined,
                    title,
                    reporter: createReporter.trim() || "Admin",
                    severity: createSeverity,
                    status: createStatus,
                    timeLabel: "Just now",
                    createdAt: nowTs,
                    description: createDescription.trim() || undefined,
                    updates: createNotifyResident && createResidentId ? [
                      {
                        id: `up_${nowTs}`,
                        createdAt: nowTs,
                        by: "Admin",
                        message: `Incident reported: ${title}`,
                      },
                    ] : [
                      {
                        id: `up_${nowTs}`,
                        createdAt: nowTs,
                        by: "Admin",
                        message: `Incident reported: ${title}`,
                      },
                    ],
                  };

                  const all = [next, ...incidents];
                  saveIncidents(all);
                  setIncidents(all);
                  setSelected(next);
                  setCreateOpen(false);

                  if (createNotifyResident && createResidentId) {
                    pushResidentNotification({
                      residentId: createResidentId,
                      type: "notice",
                      message: `Incident reported: ${title}\nStatus: ${createStatus}`,
                      meta: { incidentId: id, incidentStatus: createStatus },
                    });
                  }
                } finally {
                  setCreating(false);
                }
              }}
            >
              {creating ? "Reporting..." : "Report"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

