"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { getCurrentResidentId, pushResidentNotification } from "@/components/resident/store";
import {
  loadIncidents,
  saveIncidents,
  type IncidentRecord,
  type IncidentSeverity,
  type IncidentStatus,
  type IncidentTypeCategory,
} from "@/components/dashboard/incidentsStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { loadResidents, type ResidentRecord } from "@/components/dashboard/residentsStore";
import { createIncidentRequest, fetchMyIncidents, fetchMyProfile } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

function incidentSeverityDot(sev: IncidentSeverity) {
  if (sev === "Low") return "bg-emerald-500";
  if (sev === "Medium") return "bg-amber-500";
  return "bg-red-500";
}

function incidentStatusPillClass(status: IncidentStatus) {
  if (status === "Open") return "bg-amber-100 text-amber-700";
  if (status === "Investigating") return "bg-amber-100 text-amber-700";
  if (status === "In Progress") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function ResidentIncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<IncidentRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createSeverity, setCreateSeverity] = useState<IncidentSeverity>("Medium");
  const [createDescription, setCreateDescription] = useState("");
  const [createIncidentType, setCreateIncidentType] = useState<IncidentTypeCategory>("other");
  const [createAttachments, setCreateAttachments] = useState("");
  const [resident, setResident] = useState<ResidentRecord | null>(null);

  useEffect(() => {
    const sync = async () => {
      if (isApiMode()) {
        try {
          const [list, prof] = await Promise.all([fetchMyIncidents(), fetchMyProfile()]);
          setIncidents(list);
          setResident(prof);
        } catch {
          setIncidents([]);
          setResident(null);
        }
        return;
      }
      setIncidents(loadIncidents().filter((i) => i.residentId === getCurrentResidentId()));
      setResident(loadResidents().find((r) => r.id === getCurrentResidentId()) ?? null);
    };
    void sync();
    const onStorage = (e: StorageEvent) => {
      if (isApiMode()) return;
      if (e.key === "estateos_incidents_v1") void sync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...incidents].sort((a, b) => b.createdAt - a.createdAt);
    return [...incidents]
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q) ||
          i.severity.toLowerCase().includes(q) ||
          i.reporter.toLowerCase().includes(q),
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [incidents, query]);

  const createIncident = () => {
    if (!resident) return;
    if (!createTitle.trim()) return;

    if (isApiMode()) {
      void (async () => {
        try {
          const parseUrls = (s: string) =>
            s
              .split(/[,\n]/)
              .map((x) => x.trim())
              .filter(Boolean);
          const created = await createIncidentRequest({
            title: createTitle.trim(),
            severity: createSeverity,
            description: createDescription.trim() || undefined,
            incidentType: createIncidentType,
            attachments: parseUrls(createAttachments),
          });
          setIncidents((prev) => [created, ...prev]);
          setCreateOpen(false);
          setSelected(created);
          setCreateTitle("");
          setCreateDescription("");
          setCreateIncidentType("other");
          setCreateAttachments("");
          setCreateSeverity("Medium");
        } catch {
          /* ignore */
        }
      })();
      return;
    }

    const nowTs = Date.now();
    const parseUrls = (s: string) =>
      s
        .split(/[,\n]/)
        .map((x) => x.trim())
        .filter(Boolean);
    const nextIncident: IncidentRecord = {
      id: `inc_res_${nowTs}_${Math.random().toString(16).slice(2, 6)}`,
      residentId: resident.id,
      title: createTitle.trim(),
      reporter: resident.name,
      incidentType: createIncidentType,
      severity: createSeverity,
      status: "Open",
      timeLabel: "Just now",
      createdAt: nowTs,
      description: createDescription.trim() || undefined,
      attachments: parseUrls(createAttachments),
      updates: [
        {
          id: `upd_${nowTs}`,
          createdAt: nowTs,
          by: "Resident",
          message: "Incident reported by resident.",
        },
      ],
    };
    const next = [nextIncident, ...loadIncidents()];
    saveIncidents(next);
    setIncidents(next.filter((i) => i.residentId === getCurrentResidentId()));
    pushResidentNotification({
      residentId: resident.id,
      type: "notice",
      message: `Incident submitted: ${nextIncident.title}`,
      meta: { incidentId: nextIncident.id, incidentStatus: nextIncident.status },
    });
    setCreateOpen(false);
    setSelected(nextIncident);
    setCreateTitle("");
    setCreateDescription("");
    setCreateIncidentType("other");
    setCreateAttachments("");
    setCreateSeverity("Medium");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-card rounded-xl border border-border shadow-soft">
        <div className="p-5 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground">My Incidents</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} records</p>
          </div>
          <div className="w-full sm:max-w-sm flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search incidents..." />
            <Button className="bg-gradient-gold shadow-gold hover:opacity-90" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
        </div>

        <div className="p-5">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No incidents found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Title</th>
                    <th className="px-3 py-2 font-medium">Severity</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr
                      key={i.id}
                      className="border-t border-border hover:bg-muted/40 cursor-pointer"
                      onClick={() => setSelected(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelected(i);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <td className="px-3 py-2 text-foreground">{i.title}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${incidentSeverityDot(i.severity)}`} />
                          {i.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${incidentStatusPillClass(i.status)}`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{i.timeLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Incident"}>
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${incidentSeverityDot(selected.severity)}`} />
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${incidentStatusPillClass(selected.status)}`}>
                {selected.status}
              </span>
              <span className="text-xs text-muted-foreground">{selected.timeLabel}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reporter</p>
                <p className="mt-2 text-sm font-medium text-foreground">{selected.reporter}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Incident ID</p>
                <p className="mt-2 text-sm font-mono text-foreground">{selected.id}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
              <p className="mt-2 text-sm text-foreground leading-relaxed">{selected.description ?? "No description provided."}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Updates</p>
              {selected.updates && selected.updates.length ? (
                <div className="mt-3 space-y-3">
                  {selected.updates.map((u) => (
                    <div key={u.id} className="rounded-xl border border-border bg-background p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground">{u.by}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-foreground leading-relaxed">{u.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No updates yet.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Report incident">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Title</label>
            <Input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder="Short incident title" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Severity</label>
            <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-2">
              {(["Low", "Medium", "High"] as IncidentSeverity[]).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setCreateSeverity(sev)}
                  className={`h-10 min-w-0 rounded-lg border px-1 text-[10px] font-semibold leading-tight transition-colors sm:px-2 sm:text-xs ${
                    createSeverity === sev ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Type</label>
            <Select value={createIncidentType} onChange={(e) => setCreateIncidentType(e.target.value as IncidentTypeCategory)}>
              {(
                [
                  "theft",
                  "dispute",
                  "breach",
                  "noise",
                  "property_damage",
                  "medical",
                  "other",
                ] as IncidentTypeCategory[]
              ).map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Provide incident details..."
              className="w-full min-h-[110px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Attachment URLs (optional)
            </label>
            <Input
              value={createAttachments}
              onChange={(e) => setCreateAttachments(e.target.value)}
              placeholder="https://… , comma-separated"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-gold shadow-gold hover:opacity-90" onClick={createIncident}>
              Submit incident
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
