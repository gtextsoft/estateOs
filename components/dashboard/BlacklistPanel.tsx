"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAdminBlacklistEntry,
  fetchAdminBlacklist,
  patchAdminBlacklistEntry,
  type BlacklistEntryRecord,
} from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

export function BlacklistPanel() {
  const [rows, setRows] = useState<BlacklistEntryRecord[]>([]);
  const [identifier, setIdentifier] = useState("");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!isApiMode()) return;
    setLoading(true);
    try {
      setRows(await fetchAdminBlacklist());
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (!isApiMode()) {
    return (
      <p className="text-sm text-muted-foreground">
        Connect the app to the API to manage the gate blacklist.
      </p>
    );
  }

  const add = async () => {
    if (!identifier.trim() || !reason.trim()) return;
    try {
      await createAdminBlacklistEntry({
        identifier: identifier.trim(),
        reason: reason.trim(),
        expiresAt: expiresAt.trim() || undefined,
      });
      setIdentifier("");
      setReason("");
      setExpiresAt("");
      await load();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">Gate blacklist</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Block guest pass or resident codes from entry. Identifiers are matched case-insensitively.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Code (GPA-… or RES-…)
          </label>
          <Input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="GPA-000123"
            className="font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Expires (optional)
          </label>
          <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Reason
          </label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why this code is blocked" />
        </div>
      </div>
      <Button type="button" onClick={() => void add()} disabled={loading || !identifier.trim() || !reason.trim()}>
        Add to blacklist
      </Button>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Identifier</th>
              <th className="px-3 py-2 font-medium">Reason</th>
              <th className="px-3 py-2 font-medium">Expires</th>
              <th className="px-3 py-2 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-xs">{r.identifier}</td>
                <td className="px-3 py-2">{r.reason}</td>
                <td className="px-3 py-2 text-muted-foreground text-xs">
                  {r.expiresAt ? new Date(r.expiresAt).toLocaleString() : "—"}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() =>
                      void patchAdminBlacklistEntry(r.id, { active: !r.active }).then(() => load())
                    }
                  >
                    {r.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  No blacklist entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
