"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchPlatformPendingEstates, patchPlatformEstate } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

export default function PlatformPendingPage() {
  const [items, setItems] = useState<
    {
      estate: { id: string; name: string; slug: string; status: string };
      manager: { id: string; email: string } | null;
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isApiMode()) {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await fetchPlatformPendingEstates();
      setItems(data.map((x) => ({ estate: x.estate, manager: x.manager })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (estateId: string, action: "approve" | "reject") => {
    try {
      await patchPlatformEstate(estateId, { action });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Pending estate registrations</h2>
        <p className="text-sm text-muted-foreground">Review and approve new tenants before they go live.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending estates.</p>
      ) : (
        <ul className="space-y-3">
          {items.map(({ estate, manager }) => (
            <li
              key={estate.id}
              className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-foreground">{estate.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{estate.slug}</p>
                {manager && <p className="text-xs mt-1">Manager: {manager.email}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void act(estate.id, "approve")}
                  className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void act(estate.id, "reject")}
                  className="rounded-md border border-border px-3 py-1.5 text-sm"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
