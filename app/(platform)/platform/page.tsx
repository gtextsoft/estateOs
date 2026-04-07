"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Building2, ClipboardList, Shield, Users } from "lucide-react";

import { fetchPlatformSummary } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

export default function PlatformOverviewPage() {
  const [summary, setSummary] = useState<{
    estates: { pending: number; active: number; suspended: number; total: number };
    users: { managers: number; guards: number };
    residents: number;
  } | null>(null);
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
      const data = await fetchPlatformSummary();
      setSummary(data.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load summary");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Platform overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor tenant estates, onboarding, and footprint across the network.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading metrics…</p>
      ) : summary ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <Building2 className="h-4 w-4" />
              Total estates
            </div>
            <p className="mt-2 text-3xl font-display font-bold text-foreground">{summary.estates.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.estates.active} active · {summary.estates.pending} pending · {summary.estates.suspended}{" "}
              suspended
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <ClipboardList className="h-4 w-4" />
              Pending review
            </div>
            <p className="mt-2 text-3xl font-display font-bold text-foreground">{summary.estates.pending}</p>
            <Link
              href="/platform/pending"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-2 hover:underline"
            >
              Open queue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <Users className="h-4 w-4" />
              Residents
            </div>
            <p className="mt-2 text-3xl font-display font-bold text-foreground">{summary.residents}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all live estates</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <Shield className="h-4 w-4" />
              Staff users
            </div>
            <p className="mt-2 text-3xl font-display font-bold text-foreground">
              {summary.users.managers + summary.users.guards}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.users.managers} managers · {summary.users.guards} guards
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/platform/pending"
          className="group rounded-xl border border-border bg-card p-6 shadow-soft hover:shadow-card transition-shadow"
        >
          <h3 className="font-display font-semibold text-foreground flex items-center justify-between">
            Pending onboarding
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Approve or reject new estate registrations before they go live.
          </p>
        </Link>
        <Link
          href="/platform/estates"
          className="group rounded-xl border border-border bg-card p-6 shadow-soft hover:shadow-card transition-shadow"
        >
          <h3 className="font-display font-semibold text-foreground flex items-center justify-between">
            All estates
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Search tenants, view status, suspend or reactivate estates.
          </p>
        </Link>
      </div>
    </div>
  );
}
