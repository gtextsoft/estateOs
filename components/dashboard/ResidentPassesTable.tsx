"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Copy, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import type { GuestPass } from "@/components/resident/types";
import {
  loadPasses,
  passTypeLabel,
  savePasses,
} from "@/components/resident/store";
import {
  loadResidents,
  type ResidentRecord,
} from "@/components/dashboard/residentsStore";
import { QrCodeDisplay } from "@/components/ui/QrCodeDisplay";
import {
  fetchAdminGuestPassesAll,
  fetchAdminResidents,
  patchAdminGuestPass,
} from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

function statusPill(status: GuestPass["status"]) {
  switch (status) {
    case "active":
      return { label: "Active", cls: "bg-emerald-100 text-emerald-700" };
    case "used":
      return { label: "Used", cls: "bg-secondary text-muted-foreground" };
    case "pending":
      return { label: "Pending", cls: "bg-amber-100 text-amber-700" };
    case "revoked":
      return { label: "Revoked", cls: "bg-destructive/10 text-destructive" };
  }
}

export function ResidentPassesTable() {
  const [passes, setPasses] = useState<GuestPass[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<GuestPass | null>(null);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [page, setPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      if (isApiMode()) {
        try {
          const [p, r] = await Promise.all([fetchAdminGuestPassesAll(), fetchAdminResidents()]);
          setPasses(p);
          setResidents(r);
        } catch {
          setPasses([]);
          setResidents([]);
        }
        setOrigin(window.location.origin);
        return;
      }
      setPasses(loadPasses());
      setResidents(loadResidents());
      setOrigin(window.location.origin);
    };
    void load();
    const onStorage = (e: StorageEvent) => {
      if (isApiMode()) return;
      if (e.key === "estateos_resident_passes_v1") setPasses(loadPasses());
      if (e.key === "estateos_residents_v1") setResidents(loadResidents());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    setCopiedCode(false);
  }, [selected?.id]);

  const host = useMemo(() => {
    if (!selected) return null;
    return residents.find((r) => r.id === selected.residentId) ?? null;
  }, [residents, selected]);

  const residentsById = useMemo(() => {
    const map = new Map<string, ResidentRecord>();
    for (const r of residents) map.set(r.id, r);
    return map;
  }, [residents]);

  const setPassStatus = (id: string, status: GuestPass["status"]) => {
    if (isApiMode()) {
      void (async () => {
        try {
          await patchAdminGuestPass(id, status);
          setPasses((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
          setSelected((cur) => (cur && cur.id === id ? { ...cur, status } : cur));
        } catch {
          /* ignore */
        }
      })();
      return;
    }
    const next = passes.map((p) => (p.id === id ? { ...p, status } : p));
    setPasses(next);
    savePasses(next);
    setSelected((cur) => (cur && cur.id === id ? { ...cur, status } : cur));
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return passes;
    return passes.filter(
      (p) =>
        p.id.toLowerCase().includes(query) ||
        p.guestName.toLowerCase().includes(query),
    );
  }, [passes, q]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Input
          placeholder="Search visitors..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-3"
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">
                Visitor
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5 hidden md:table-cell">
                Host
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">
                Type
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5 hidden md:table-cell">
                Date/Time
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.map((p) => {
              const pill = statusPill(p.status);
              return (
                <tr
                  key={p.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelected(p)}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <QrCode className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {p.guestName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground hidden md:table-cell">
                    {(() => {
                      const r = residentsById.get(p.residentId);
                      return r ? `${r.name} (${r.unit})` : "—";
                    })()}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {passTypeLabel(p.passType)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {p.validUntilLabel}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${pill.cls}`}
                    >
                      {pill.label}
                    </span>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  No passes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        onPageChange={setPage}
      />

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Guest pass details"
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-background rounded-xl border border-border p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Name:</p>
                    <p className="font-display text-lg font-semibold text-foreground">
                      {selected.guestName}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {passTypeLabel(selected.passType)} · ID: {selected.id}
                  </p>

                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Visitor code</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm text-foreground break-all rounded-md border border-border bg-muted/30 px-3 py-1">
                        {selected.code}
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(selected.code);
                            setCopiedCode(true);
                            window.setTimeout(() => setCopiedCode(false), 1500);
                          } catch {
                            // ignore
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy code
                      </Button>

                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border transition-all ${
                          copiedCode
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 opacity-100 translate-y-0"
                            : "border-transparent bg-transparent text-transparent opacity-0 -translate-y-0.5 pointer-events-none select-none"
                        }`}
                        aria-live="polite"
                      >
                        Copied!
                      </span>
                    </div>
                  </div>
                </div>

                <QrCodeDisplay
                  value={
                    origin
                      ? `${origin}/dashboard/security?code=${encodeURIComponent(selected.code)}`
                      : ""
                  }
                  size={96}
                  showDownload
                  downloadFilename={`security-${selected.code}.png`}
                />
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground">
                    {selected.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valid</p>
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />{" "}
                    {selected.validUntilLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Host (resident)
                  </p>
                  {host && (
                    <div className="flex flex-col gap-2">
                      <p className="font-medium text-foreground">
                        {host.name} · Unit {host.unit}
                      </p>
                      <Link
                        href={`/dashboard/residents/${host.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                        onClick={() => setSelected(null)}
                      >
                        View host details
                      </Link>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin actions
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(
                    [
                      {
                        key: "active",
                        label: "Set Active",
                        cls: "border-border bg-background hover:bg-muted",
                      },
                      {
                        key: "pending",
                        label: "Set Pending",
                        cls: "border-border bg-background hover:bg-muted",
                      },
                      {
                        key: "used",
                        label: "Mark Used",
                        cls: "border-border bg-background hover:bg-muted",
                      },
                      {
                        key: "revoked",
                        label: "Revoke",
                        cls: "border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive",
                      },
                    ] as const
                  ).map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      className={`h-10 px-4 rounded-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${a.cls}`}
                      disabled={selected.status === a.key}
                      onClick={() => setPassStatus(selected.id, a.key)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
