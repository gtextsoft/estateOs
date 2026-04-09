"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, MoreVertical, Plus, QrCode, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { QrCodeDisplay } from "@/components/ui/QrCodeDisplay";
import type { GuestPass, PassType } from "@/components/resident/types";
import {
  getCurrentResidentId,
  loadPasses,
  passStatusBadgeVariant,
  passTypeLabel,
  savePasses,
} from "@/components/resident/store";
import {
  createGuestPassRequest,
  fetchMyGuestPasses,
  revokeGuestPassRequest,
} from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

function nextPassId(existing: GuestPass[]) {
  const nums = existing
    .map((p) => Number(p.id.replace(/^GPA-/, "")))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `GPA-${String(next).padStart(3, "0")}`;
}

export default function ResidentGuestPassesPage() {
  const [passes, setPasses] = useState<GuestPass[]>([]);
  const [selectedPass, setSelectedPass] = useState<GuestPass | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestType, setGuestType] = useState<PassType>("single");
  const [validDate, setValidDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("17:00");

  useEffect(() => {
    const load = async () => {
      if (isApiMode()) {
        try {
          setPasses(await fetchMyGuestPasses());
        } catch {
          setPasses([]);
        }
        setOrigin(window.location.origin);
        return;
      }
      setPasses(loadPasses().filter((p) => p.residentId === getCurrentResidentId()));
      setOrigin(window.location.origin);
    };
    void load();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (isApiMode()) return;
      if (e.key === "estateos_resident_passes_v1") {
        setPasses(loadPasses().filter((p) => p.residentId === getCurrentResidentId()));
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuFor(null);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...passes].sort((a, b) => b.createdAt - a.createdAt);
    if (!q) return sorted;
    return sorted.filter((p) => p.guestName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }, [passes, query]);

  const createPass = () => {
    const name = guestName.trim();
    if (!name) return;
    const dateLabel = new Date(validDate).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const validUntilLabel =
      guestType === "permanent"
        ? "No expiry"
        : guestType === "service"
          ? `${dateLabel} ${timeStart} – ${timeEnd}`
          : `${dateLabel}, 11:59 PM`;

    if (isApiMode()) {
      void (async () => {
        try {
          const created = await createGuestPassRequest({
            guestName: name,
            passType: guestType,
            date: validDate,
            timeStart: guestType === "service" ? timeStart : undefined,
            timeEnd: guestType === "service" ? timeEnd : undefined,
          });
          setPasses((prev) => [created, ...prev]);
          setSelectedPass(created);
        } catch {
          /* ignore */
        }
      })();
    } else {
      const id = nextPassId(loadPasses());
      const newPass: GuestPass = {
        id,
        code: id,
        residentId: getCurrentResidentId(),
        guestName: name,
        passType: guestType,
        validUntilLabel,
        status: "active",
        createdAt: Date.now(),
        date: validDate,
        timeStart: guestType === "service" ? timeStart : undefined,
        timeEnd: guestType === "service" ? timeEnd : undefined,
      };
      const all = loadPasses();
      const nextAll = [newPass, ...all];
      savePasses(nextAll);
      setPasses(nextAll.filter((p) => p.residentId === getCurrentResidentId()));
      setSelectedPass(newPass);
    }
    setCreateOpen(false);
    setGuestName("");
    setGuestType("single");
    setValidDate(new Date().toISOString().slice(0, 10));
  };

  const revokeById = (id: string) => {
    if (isApiMode()) {
      void (async () => {
        try {
          await revokeGuestPassRequest(id);
          setPasses((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: "revoked" as const } : p)),
          );
          setSelectedPass((cur) => (cur && cur.id === id ? { ...cur, status: "revoked" } : cur));
        } catch {
          /* ignore */
        }
      })();
      return;
    }
    const all = loadPasses();
    const nextAll = all.map((p) => (p.id === id ? { ...p, status: "revoked" as const } : p));
    savePasses(nextAll);
    setPasses(nextAll.filter((p) => p.residentId === getCurrentResidentId()));
    setSelectedPass((cur) => (cur && cur.id === id ? { ...cur, status: "revoked" } : cur));
  };

  return (
    <div className="max-w-6xl mx-auto bg-card rounded-xl border border-border shadow-soft">
      <div className="p-5 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">My Guest Passes</h1>
          <p className="text-sm text-muted-foreground">{passes.length} records</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search passes..." />
          <Button className="bg-gradient-gold shadow-gold hover:opacity-90" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">No guest passes found.</div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="w-full text-left bg-background rounded-xl border border-border p-4 shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
                  onClick={() => setSelectedPass(p)}
                  aria-label="Open guest pass details"
                >
                  {p.passType === "permanent" ? (
                    <User className="h-5 w-5 text-primary" />
                  ) : p.passType === "service" ? (
                    <Shield className="h-5 w-5 text-primary" />
                  ) : (
                    <QrCode className="h-5 w-5 text-primary" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPass(p)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-semibold text-foreground truncate">{p.guestName}</p>
                    <Badge variant={passStatusBadgeVariant(p.status)}>{passTypeLabel(p.passType)}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {p.validUntilLabel}
                  </div>
                </button>
                <div className="text-xs font-mono text-muted-foreground shrink-0">ID: {p.id}</div>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                    onClick={() => setMenuFor((cur) => (cur === p.id ? null : p.id))}
                    aria-label="Pass actions"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {menuFor === p.id && (
                    <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-card overflow-hidden z-20">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => {
                          setMenuFor(null);
                          setSelectedPass(p);
                        }}
                      >
                        View details
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-destructive"
                        onClick={() => {
                          setMenuFor(null);
                          revokeById(p.id);
                        }}
                      >
                        Revoke
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Guest Pass">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Guest name</label>
            <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full name of your guest" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pass type</label>
            <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-2">
              {(["single", "service", "permanent"] as PassType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setGuestType(t)}
                  className={`h-10 min-w-0 rounded-lg border px-1 text-[10px] font-semibold leading-tight transition-colors sm:px-2 sm:text-xs ${
                    guestType === t ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {passTypeLabel(t)}
                </button>
              ))}
            </div>
          </div>
          {guestType === "service" && (
            <div className="grid grid-cols-2 gap-3">
              <Input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
              <Input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Valid date</label>
            <Input type="date" value={validDate} onChange={(e) => setValidDate(e.target.value)} />
          </div>
          <Button className="w-full bg-gradient-gold shadow-gold hover:opacity-90" onClick={createPass}>
            <QrCode className="h-4 w-4 mr-2" />
            Generate Guest Pass
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!selectedPass} onClose={() => setSelectedPass(null)} title={selectedPass?.guestName ?? ""}>
        {selectedPass && (
          <div className="flex flex-col items-center text-center space-y-4">
            <Badge variant={passStatusBadgeVariant(selectedPass.status)} className="mx-auto">
              {passTypeLabel(selectedPass.passType)}
            </Badge>
            <div className="mx-auto">
              <QrCodeDisplay
                value={origin ? `${origin}/dashboard/security?code=${encodeURIComponent(selectedPass.code)}` : ""}
                size={128}
                showDownload
                downloadFilename={`security-${selectedPass.code}.png`}
              />
            </div>
            <div className="text-xs font-mono text-muted-foreground break-all">Code: {selectedPass.code}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" /> {selectedPass.validUntilLabel}
            </div>
            <Button className="w-full bg-destructive text-destructive-foreground" onClick={() => revokeById(selectedPass.id)}>
              Revoke pass
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
