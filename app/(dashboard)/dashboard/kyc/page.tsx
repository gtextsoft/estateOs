"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { fetchAdminKycPending, reviewAdminKyc } from "@/lib/estate-api";
import { getClientRole, isApiMode } from "@/lib/session";

type Row = { _id?: unknown; email?: string; role?: string; kyc?: Record<string, unknown> };

export default function ManagerKycPage() {
  const [users, setUsers] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isApiMode() || getClientRole() !== "manager") {
        setError("Manager sign-in required.");
        setUsers([]);
        return;
      }
      const raw = await fetchAdminKycPending();
      setUsers(raw as unknown as Row[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const act = async (userId: string, action: "approve" | "reject") => {
    try {
      await reviewAdminKyc(userId, action);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs text-primary hover:underline mb-2 inline-block">
          ← Dashboard
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground">KYC queue</h1>
        <p className="text-sm text-muted-foreground">Approve residents and guards for your estate.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending applications.</p>
      ) : (
        <ul className="space-y-3">
          {users.map((u) => {
            const uid = String(u._id ?? "");
            return (
            <li
              key={uid}
              className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="font-medium text-foreground">{u.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void act(uid, "approve")}
                  className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void act(uid, "reject")}
                  className="rounded-md border border-border px-3 py-1.5 text-sm"
                >
                  Reject
                </button>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
