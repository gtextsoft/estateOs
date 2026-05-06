"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { PlatformEstateRow } from "@/lib/estate-api";
import { deletePlatformEstate, fetchPlatformEstates, patchPlatformEstate } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

type Filter = "all" | "pending" | "active" | "suspended";
type ToastTone = "success" | "error" | "warning";

export default function PlatformEstatesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<PlatformEstateRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    if (!isApiMode()) {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await fetchPlatformEstates(filter === "all" ? undefined : filter);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const tabs = useMemo(
    () =>
      [
        { id: "all" as const, label: "All" },
        { id: "pending" as const, label: "Pending" },
        { id: "active" as const, label: "Active" },
        { id: "suspended" as const, label: "Suspended" },
      ] as const,
    [],
  );

  const runAction = async (estateId: string, action: "approve" | "reject" | "suspend" | "reactivate") => {
    setBusyId(estateId);
    setError(null);
    try {
      await patchPlatformEstate(estateId, { action });
      await load();
      setToast({ message: `Estate updated: ${action}.`, tone: "success" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
      setToast({ message: e instanceof Error ? e.message : "Update failed", tone: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const requestDelete = (estateId: string, estateName: string) => {
    setPendingDelete({ id: estateId, name: estateName });
    setToast({
      message: `Delete "${estateName}"? This permanently removes the estate and related tenant data.`,
      tone: "warning",
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    setError(null);
    try {
      await deletePlatformEstate(pendingDelete.id);
      await load();
      setToast({ message: `Estate "${pendingDelete.name}" deleted.`, tone: "success" });
      setPendingDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setToast({ message: e instanceof Error ? e.message : "Delete failed", tone: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const statusBadge = (status: string) => {
    const base = "text-xs font-medium px-2 py-0.5 rounded-full capitalize";
    if (status === "active") return <span className={`${base} bg-emerald-100 text-emerald-800`}>{status}</span>;
    if (status === "pending") return <span className={`${base} bg-amber-100 text-amber-800`}>{status}</span>;
    return <span className={`${base} bg-secondary text-muted-foreground`}>{status}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-60 w-[min(28rem,calc(100vw-2rem))]">
          <div
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.tone === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : toast.tone === "warning"
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            <p>{toast.message}</p>
            <div className="mt-3 flex items-center justify-end gap-2">
              {pendingDelete && toast.tone === "warning" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDelete(null);
                      setToast(null);
                    }}
                    className="rounded-md border border-border px-2.5 py-1 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={busyId === pendingDelete.id}
                    onClick={() => void confirmDelete()}
                    className="rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground disabled:opacity-50"
                  >
                    Confirm delete
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="rounded-md border border-border px-2.5 py-1 text-xs"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-xl font-bold text-foreground">All estates</h2>
        <p className="text-sm text-muted-foreground">
          Tenant directory: approve pending registrations, or suspend / reactivate live estates.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No estates in this view.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-4 py-3 font-semibold text-foreground">Estate</th>
                  <th className="px-4 py-3 font-semibold text-foreground hidden md:table-cell">Manager</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Residents</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(({ estate, manager, residentCount }) => (
                  <tr key={estate.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-foreground">{estate.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">{estate.slug}</p>
                    </td>
                    <td className="px-4 py-3 align-top hidden md:table-cell text-muted-foreground">
                      {manager?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-top">{residentCount}</td>
                    <td className="px-4 py-3 align-top">{statusBadge(estate.status)}</td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {estate.status === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={busyId === estate.id}
                              onClick={() => void runAction(estate.id, "approve")}
                              className="rounded-md bg-primary text-primary-foreground px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={busyId === estate.id}
                              onClick={() => void runAction(estate.id, "reject")}
                              className="rounded-md border border-border px-2.5 py-1 text-xs disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {estate.status === "active" && (
                          <button
                            type="button"
                            disabled={busyId === estate.id}
                            onClick={() => void runAction(estate.id, "suspend")}
                            className="rounded-md border border-destructive/40 text-destructive px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                        {estate.status === "suspended" && (
                          <button
                            type="button"
                            disabled={busyId === estate.id}
                            onClick={() => void runAction(estate.id, "reactivate")}
                            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                          >
                            Reactivate
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busyId === estate.id}
                          onClick={() => requestDelete(estate.id, estate.name)}
                          className="rounded-md border border-destructive/50 text-destructive px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
