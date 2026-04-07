"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Loader2, MoreHorizontal, Plus, QrCode, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createResidentId, loadResidents, saveResidents, type ResidentRecord } from "@/components/dashboard/residentsStore";
import { createAdminResident, fetchAdminResidents } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";
import { revokePassesForResident } from "@/components/resident/store";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { QrCodeDisplay } from "@/components/ui/QrCodeDisplay";

function monthYearLabel(ts = Date.now()) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [q, setQ] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [selected, setSelected] = useState<ResidentRecord | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [origin, setOrigin] = useState<string>("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [unit, setUnit] = useState("");
  const [phone, setPhone] = useState("");
  const [building, setBuilding] = useState("");
  const [block, setBlock] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewResidentId, setPreviewResidentId] = useState<string>("");

  const canSave = useMemo(() => {
    return name.trim().length >= 2 && email.trim().includes("@") && unit.trim().length >= 2;
  }, [name, email, unit]);

  useEffect(() => {
    const n = name.trim();
    if (n.length < 2) {
      setPreviewResidentId("");
      return;
    }
    // createResidentId includes randomness; we store it so preview + save match.
    setPreviewResidentId(createResidentId(n));
  }, [name]);

  const onCreate = async () => {
    setError(null);
    if (!canSave) {
      setError("Please enter name, email, and unit.");
      return;
    }
    setSaving(true);
    try {
      if (isApiMode()) {
        const record = await createAdminResident({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          unit: unit.trim().toUpperCase(),
          phone: phone.trim() || undefined,
          building: building.trim() || undefined,
          block: block.trim() || undefined,
        });
        setResidents((prev) => [record, ...prev.filter((r) => r.id !== record.id)]);
        setPage(1);
        setSelected(null);
        setCopiedEmail(false);
        setCreateOpen(false);
        setName("");
        setEmail("");
        setUnit("");
        setPhone("");
        setBuilding("");
        setBlock("");
        setPreviewResidentId("");
        return;
      }
      await new Promise((r) => setTimeout(r, 650));
      const existing = loadResidents();
      const residentId = previewResidentId || createResidentId(name);
      const record: ResidentRecord = {
        id: residentId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        unit: unit.trim().toUpperCase(),
        building: building.trim() || undefined,
        block: block.trim() || undefined,
        phone: phone.trim() || undefined,
        status: "Pending",
        since: monthYearLabel(),
      };
      const next = [record, ...existing];
      saveResidents(next);
      setResidents(next);
      setPage(1);
      setSelected(null);
      setCopiedEmail(false);
      setCreateOpen(false);
      setName("");
      setEmail("");
      setUnit("");
      setPhone("");
      setBuilding("");
      setBlock("");
      setPreviewResidentId("");
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isApiMode()) {
      void (async () => {
        try {
          setResidents(await fetchAdminResidents());
        } catch {
          setResidents([]);
        }
      })();
    } else {
      setResidents(loadResidents());
    }
    setOrigin(window.location.origin);
    const onStorage = (e: StorageEvent) => {
      if (isApiMode()) return;
      if (e.key === "estateos_residents_v1") setResidents(loadResidents());
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuFor(null);
    };
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-resident-menu-root]")) setMenuFor(null);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return residents;
    return residents.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.unit.toLowerCase().includes(query),
    );
  }, [residents, q]);

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

  const deactivate = (id: string) => {
    const next = residents.map((r) => (r.id === id ? { ...r, status: "Inactive" as const } : r));
    setResidents(next);
    saveResidents(next);
    revokePassesForResident(id);
    setSelected((cur) => (cur && cur.id === id ? { ...cur, status: "Inactive" as const } : cur));
  };

  const approve = (id: string) => {
    const next = residents.map((r) => (r.id === id ? { ...r, status: "Active" as const } : r));
    setResidents(next);
    saveResidents(next);
    setSelected((cur) => (cur && cur.id === id ? { ...cur, status: "Active" as const } : cur));
  };

  const reactivate = (id: string) => {
    const next = residents.map((r) => (r.id === id ? { ...r, status: "Active" as const } : r));
    setResidents(next);
    saveResidents(next);
    setSelected((cur) => (cur && cur.id === id ? { ...cur, status: "Active" as const } : cur));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Residents</h1>
          <p className="text-sm text-muted-foreground">Manage your estate&apos;s residents and unit assignments.</p>
        </div>
        <Button
          className="bg-gradient-gold shadow-gold hover:opacity-90"
          onClick={() => {
            setCreateOpen(true);
            setSelected(null);
            setCopiedEmail(false);
            setMenuFor(null);
            setError(null);
            setName("");
            setEmail("");
            setUnit("");
            setPhone("");
            setBuilding("");
            setBlock("");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search residents..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Resident</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Unit</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 hidden md:table-cell">Email</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 hidden md:table-cell">Since</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelected(r)}
              >
                <td className="px-5 py-3 relative">
                  <div className="relative flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {r.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="text-sm font-medium text-foreground">{r.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{r.unit}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">{r.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      r.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">{r.since}</td>
                <td className="px-5 py-3">
                  <div className="relative" data-resident-menu-root>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuFor((cur) => (cur === r.id ? null : r.id));
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>

                    {menuFor === r.id && (
                      <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-card overflow-hidden z-20">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => {
                            setMenuFor(null);
                            setSelected(r);
                          }}
                        >
                          View details
                        </button>
                        {r.status === "Pending" && (
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onClick={() => {
                              setMenuFor(null);
                              approve(r.id);
                            }}
                          >
                            Approve
                          </button>
                        )}
                        <button
                          type="button"
                          className="w-full cursor-pointer text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={async () => {
                            setMenuFor(null);
                            try {
                              await navigator.clipboard.writeText(r.email);
                            } catch {
                              // ignore
                            }
                          }}
                        >
                          Copy email
                        </button>
                        <button
                          type="button"
                          className="w-full cursor-pointer text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-destructive disabled:opacity-50"
                          disabled={r.status === "Inactive"}
                          onClick={() => {
                            setMenuFor(null);
                            deactivate(r.id);
                          }}
                        >
                          Deactivate
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No residents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />

      <Modal
        isOpen={!!selected}
        onClose={() => {
          setSelected(null);
          setCopiedEmail(false);
        }}
        title="Resident details"
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-background rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-display text-lg font-semibold text-foreground">{selected.name}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    selected.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : selected.status === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {selected.status}
                </span>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Unit</p>
                  <p className="font-medium text-foreground">{selected.unit}</p>
                </div>
                {(selected.building || selected.block) && (
                  <div>
                    <p className="text-xs text-muted-foreground">Building / block</p>
                    <p className="font-medium text-foreground">
                      {[selected.building, selected.block].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex flex-col gap-2">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground break-all min-w-0 flex-1">{selected.email}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-2 shrink-0">
                      <button
                        type="button"
                        className="h-8 w-8 rounded-md border border-border bg-background hover:bg-muted flex items-center justify-center"
                        aria-label="Copy email"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(selected.email);
                            setCopiedEmail(true);
                            window.setTimeout(() => setCopiedEmail(false), 1500);
                          } catch {
                            // ignore
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </button>

                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border transition-all ${
                          copiedEmail
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
                <div>
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="font-medium text-foreground">{selected.since}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{selected.phone ?? "—"}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Resident code</p>
                    <p className="font-mono text-sm text-foreground break-all mt-1">
                      {selected.id}
                    </p>
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(selected.id);
                          } catch {
                            // ignore
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy code
                      </Button>
                    </div>
                  </div>

                  <QrCodeDisplay
                    value={
                      origin
                        ? `${origin}/dashboard/security?code=${encodeURIComponent(selected.id)}`
                        : ""
                    }
                    size={96}
                    showDownload
                    downloadFilename={`security-${selected.id}.png`}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {/* Primary CTA */}
                <Link
                  href={`/dashboard/residents/${selected.id}`}
                  className="w-full inline-flex py-2 items-center justify-center rounded-md bg-gradient-gold shadow-gold hover:opacity-90 transition-opacity px-4 text-sm font-medium text-primary-foreground"
                  onClick={() => {
                    setSelected(null);
                    setCopiedEmail(false);
                  }}
                >
                  Open full profile
                </Link>

                {/* Status / lifecycle actions */}
                {(selected.status === "Pending" || selected.status === "Inactive") && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status actions
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {selected.status === "Pending" && (
                        <button
                          type="button"
                          className="h-10 px-4 rounded-md border border-border bg-background hover:bg-muted text-sm font-medium"
                          onClick={() => approve(selected.id)}
                        >
                          Approve resident
                        </button>
                      )}

                      {selected.status === "Inactive" && (
                        <button
                          type="button"
                          className="h-10 px-4 rounded-md border border-border bg-background hover:bg-muted text-sm font-medium"
                          onClick={() => reactivate(selected.id)}
                        >
                          Reactivate resident
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Danger zone */}
                <div className="mt-10 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                    Danger zone
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Deactivating blocks resident access and revokes all guest passes linked to this resident.
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      className="w-full h-10 px-4 rounded-md cursor-pointer border border-destructive/30 bg-background hover:bg-destructive/10 text-sm font-medium text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={selected.status === "Inactive"}
                      onClick={() => deactivate(selected.id)}
                    >
                      Deactivate resident
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setError(null);
          setPreviewResidentId("");
        }}
        title="Add Resident"
      >
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Full name
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chukwuemeka Eze" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Email
              </label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="e.g. emeka@mail.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Unit
              </label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. A-01" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Phone (optional)
              </label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +2348012345678" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Building (optional)
              </label>
              <Input value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="e.g. Tower A" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Block (optional)
              </label>
              <Input value={block} onChange={(e) => setBlock(e.target.value)} placeholder="e.g. East" />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Resident code
                </p>
                <p className="mt-2 font-mono text-sm text-foreground break-all">
                  {previewResidentId || "—"}
                </p>
              </div>
              <div className="shrink-0">
                {previewResidentId ? (
                  <QrCodeDisplay
                    value={origin ? `${origin}/dashboard/security?code=${encodeURIComponent(previewResidentId)}` : ""}
                    size={96}
                    showDownload
                    downloadFilename={`security-${previewResidentId}.png`}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg border border-border bg-background" />
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!previewResidentId}
                onClick={async () => {
                  if (!previewResidentId) return;
                  try {
                    await navigator.clipboard.writeText(previewResidentId);
                  } catch {
                    // ignore
                  }
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy code
              </Button>
              <p className="text-xs text-muted-foreground">
                Used for resident ID and QR.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              className="bg-gradient-gold shadow-gold hover:opacity-90 cursor-pointer"
              onClick={onCreate}
              disabled={saving || !canSave}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {saving ? "Saving..." : "Create resident"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

