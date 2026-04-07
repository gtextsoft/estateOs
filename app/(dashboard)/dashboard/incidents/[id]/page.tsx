"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  loadIncidents,
  saveIncidents,
  type IncidentRecord,
  type IncidentStatus,
} from "@/components/dashboard/incidentsStore";
import {
  fetchAdminIncidentDetail,
  patchAdminIncident,
} from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

export default function IncidentDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [draftStatus, setDraftStatus] = useState<IncidentStatus>("Open");
  const [draftUpdate, setDraftUpdate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        if (isApiMode()) {
          const detail = await fetchAdminIncidentDetail(id);
          setIncident({ ...detail.incident, updates: detail.updates });
          setDraftStatus(detail.incident.status);
        } else {
          const found = loadIncidents().find((i) => i.id === id) ?? null;
          setIncident(found);
          if (found) setDraftStatus(found.status);
        }
      } catch {
        setIncident(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const inc = incident;

  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Loading incident…</p>
      </div>
    );
  }

  if (!inc) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-foreground">Incident not found</h1>
        <p className="text-sm text-muted-foreground">This incident does not exist.</p>
        <Link href="/dashboard/incidents" className="text-sm font-medium text-primary hover:underline">
          Back to Incidents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{inc.title}</h1>
          <p className="text-sm text-muted-foreground">Incident details and actions.</p>
        </div>
        <Link href="/dashboard/incidents" className="text-sm font-medium text-primary hover:underline">
          Back
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 h-10 w-10 rounded-lg flex items-center justify-center ${
              inc.severity === "High"
                ? "bg-destructive/10"
                : inc.severity === "Medium"
                  ? "bg-amber-100"
                  : "bg-muted"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${
                inc.severity === "High"
                  ? "text-destructive"
                  : inc.severity === "Medium"
                    ? "text-amber-700"
                    : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
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
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                Severity: {inc.severity}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {inc.timeLabel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Reported by {inc.reporter}</p>
            {inc.description && (
              <p className="text-sm text-foreground mt-4 leading-relaxed">{inc.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft">
        <div className="p-5 border-b border-border">
          <h3 className="font-display text-lg font-semibold text-foreground">Actions</h3>
          <p className="text-sm text-muted-foreground">Update status and add an internal note.</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Status</p>
              <Select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as IncidentStatus)}>
                {(["Open", "Investigating", "In Progress", "Resolved"] as IncidentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Update note (optional)</p>
            <textarea
              value={draftUpdate}
              onChange={(e) => setDraftUpdate(e.target.value)}
              placeholder="Add investigation notes…"
              className="w-full min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button
            type="button"
            className="bg-gradient-gold shadow-gold hover:opacity-90"
            disabled={saving}
            onClick={() => {
              if (isApiMode()) {
                setSaving(true);
                void (async () => {
                  try {
                    const msg =
                      draftUpdate.trim() ||
                      `Status updated to ${draftStatus} for: ${inc.title}`;
                    await patchAdminIncident(inc.id, { status: draftStatus, message: msg });
                    const detail = await fetchAdminIncidentDetail(inc.id);
                    setIncident({ ...detail.incident, updates: detail.updates });
                    setDraftUpdate("");
                  } finally {
                    setSaving(false);
                  }
                })();
                return;
              }
              const updateMessage =
                draftUpdate.trim() || `Status updated to ${draftStatus} for: ${inc.title}`;
              const updateItem = {
                id: `incu-${Date.now()}`,
                createdAt: Date.now(),
                by: "Admin",
                message: updateMessage,
              };
              const next = loadIncidents().map((i) =>
                i.id === inc.id
                  ? { ...i, status: draftStatus, updates: [updateItem, ...(i.updates ?? [])] }
                  : i,
              );
              saveIncidents(next);
              setIncident(next.find((i) => i.id === inc.id) ?? null);
              setDraftUpdate("");
            }}
          >
            {saving ? "Saving…" : "Save update"}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-3">Updates timeline</h3>
        <div className="divide-y divide-border max-h-80 overflow-y-auto">
          {(inc.updates ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No updates yet.</p>
          ) : (
            (inc.updates ?? []).map((u) => (
              <div key={u.id} className="py-3">
                <p className="text-sm font-medium text-foreground">{u.by}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(u.createdAt).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{u.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
