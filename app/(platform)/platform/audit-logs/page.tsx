"use client";

import { useCallback, useEffect, useState } from "react";

import { exportPlatformAuditLogsCsv, fetchPlatformAuditLogs, type AuditLogRecord } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

export default function PlatformAuditLogsPage() {
  const [items, setItems] = useState<AuditLogRecord[]>([]);
  const [estateId, setEstateId] = useState("");
  const [action, setAction] = useState("");
  const [actorRole, setActorRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const load = useCallback(async () => {
    if (!isApiMode()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const out = await fetchPlatformAuditLogs({
        estateId: estateId.trim() || undefined,
        action: action.trim() || undefined,
        actorRole: actorRole || undefined,
        page,
        limit: 25,
      });
      setItems(out.items);
      setTotalPages(out.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit logs");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [estateId, action, actorRole, page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Platform audit logs</h2>
        <p className="text-sm text-muted-foreground">
          View actions across all estates with pagination.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <input
          value={estateId}
          onChange={(e) => {
            setPage(1);
            setEstateId(e.target.value);
          }}
          placeholder="Estate ID"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          value={action}
          onChange={(e) => {
            setPage(1);
            setAction(e.target.value);
          }}
          placeholder="Action"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          value={actorRole}
          onChange={(e) => {
            setPage(1);
            setActorRole(e.target.value);
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All actor roles</option>
          <option value="platform_admin">Platform admin</option>
          <option value="manager">Manager</option>
          <option value="guard">Guard</option>
          <option value="resident">Resident</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setEstateId("");
            setAction("");
            setActorRole("");
            setPage(1);
          }}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          Reset filters
        </button>
        <button
          type="button"
          disabled={exporting}
          onClick={() => {
            void (async () => {
              setExporting(true);
              setError(null);
              try {
                const blob = await exportPlatformAuditLogsCsv({
                  estateId: estateId.trim() || undefined,
                  action: action.trim() || undefined,
                  actorRole: actorRole || undefined,
                });
                downloadBlob(blob, `platform-audit-logs-${Date.now()}.csv`);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Export failed");
              } finally {
                setExporting(false);
              }
            })();
          }}
          className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-3 py-2 font-semibold">Time</th>
              <th className="px-3 py-2 font-semibold">Estate</th>
              <th className="px-3 py-2 font-semibold">Action</th>
              <th className="px-3 py-2 font-semibold">Actor role</th>
              <th className="px-3 py-2 font-semibold">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-muted-foreground" colSpan={5}>
                  Loading audit logs...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-muted-foreground" colSpan={5}>
                  No logs found.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.estateId || "-"}</td>
                  <td className="px-3 py-2 font-medium">{row.action}</td>
                  <td className="px-3 py-2">{row.actorRole}</td>
                  <td className="px-3 py-2">
                    {row.targetType || "-"} {row.targetId ? `(${row.targetId.slice(0, 8)}...)` : ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
