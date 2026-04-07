"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Plus, QrCode, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { ResidentPassesTable } from "@/components/dashboard/ResidentPassesTable";
import { loadResidents, type ResidentRecord } from "@/components/dashboard/residentsStore";
import type { GuestPass, PassType } from "@/components/resident/types";
import { loadPasses, savePasses } from "@/components/resident/store";
import {
  createAdminGuestPass,
  fetchAdminGuestPassesAll,
  fetchAdminResidents,
  fetchExpectedGuestPasses,
} from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

function nextPassId(existing: GuestPass[]) {
  const nums = existing
    .map((p) => Number(String(p.id).replace(/^GPA-/, "")))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `GPA-${String(next).padStart(3, "0")}`;
}

export default function VisitorsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [passes, setPasses] = useState<GuestPass[]>([]);
  const [passesTableKey, setPassesTableKey] = useState(0);

  const [hostResidentId, setHostResidentId] = useState<string>("");
  const [guestName, setGuestName] = useState("");
  const [guestType, setGuestType] = useState<PassType>("single");
  const [validDate, setValidDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("17:00");
  const [error, setError] = useState<string | null>(null);
  const [expectedDate, setExpectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expectedPasses, setExpectedPasses] = useState<
    (GuestPass & { residentName?: string; residentUnit?: string })[]
  >([]);

  useEffect(() => {
    const load = async () => {
      if (isApiMode()) {
        try {
          const [r, p] = await Promise.all([fetchAdminResidents(), fetchAdminGuestPassesAll()]);
          setResidents(r);
          setPasses(p);
        } catch {
          setResidents([]);
          setPasses([]);
        }
        return;
      }
      setResidents(loadResidents());
      setPasses(loadPasses());
    };
    void load();
    const onStorage = (e: StorageEvent) => {
      if (isApiMode()) return;
      if (e.key === "estateos_residents_v1") setResidents(loadResidents());
      if (e.key === "estateos_resident_passes_v1") setPasses(loadPasses());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!isApiMode()) {
      const d = expectedDate;
      setExpectedPasses(
        passes.filter(
          (p) =>
            p.status === "active" &&
            (p.passType === "permanent" || (p.date && p.date === d)),
        ),
      );
      return;
    }
    void (async () => {
      try {
        const list = await fetchExpectedGuestPasses(expectedDate);
        setExpectedPasses(list);
      } catch {
        setExpectedPasses([]);
      }
    })();
  }, [isApiMode, expectedDate, passes]);

  const activeResidents = useMemo(
    () => residents.filter((r) => r.status === "Active"),
    [residents],
  );

  useEffect(() => {
    if (!hostResidentId && activeResidents.length) setHostResidentId(activeResidents[0].id);
  }, [activeResidents, hostResidentId]);

  const activePassesCount = useMemo(
    () => passes.filter((p) => p.status === "active").length,
    [passes],
  );

  const onCreate = () => {
    const host = activeResidents.find((r) => r.id === hostResidentId);
    const name = guestName.trim();
    if (!host) {
      setError("Select a valid active resident host.");
      return;
    }
    if (!name) {
      setError("Guest name is required.");
      return;
    }
    setError(null);

    if (isApiMode()) {
      void (async () => {
        try {
          const newPass = await createAdminGuestPass(host.id, {
            guestName: name,
            passType: guestType,
            date: validDate,
            timeStart: guestType === "service" ? timeStart : undefined,
            timeEnd: guestType === "service" ? timeEnd : undefined,
          });
          setPasses((prev) => [newPass, ...prev]);
          setPassesTableKey((k) => k + 1);
        } catch {
          setError("Could not create pass. Try again.");
        }
      })();
      setGuestName("");
      setGuestType("single");
      setValidDate(new Date().toISOString().slice(0, 10));
      setTimeStart("09:00");
      setTimeEnd("17:00");
      setCreateOpen(false);
      return;
    }

    const id = nextPassId(passes);
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

    const newPass: GuestPass = {
      id,
      code: id,
      residentId: host.id,
      guestName: name,
      passType: guestType,
      validUntilLabel,
      status: "active",
      createdAt: Date.now(),
      date: validDate,
      timeStart: guestType === "service" ? timeStart : undefined,
      timeEnd: guestType === "service" ? timeEnd : undefined,
    };

    const next = [newPass, ...passes];
    setPasses(next);
    savePasses(next);

    setGuestName("");
    setGuestType("single");
    setValidDate(new Date().toISOString().slice(0, 10));
    setTimeStart("09:00");
    setTimeEnd("17:00");
    setCreateOpen(false);
  };

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold text-foreground">Visitor Access</h1>
          <p className="text-sm text-muted-foreground">Manage guest passes and visitor entries.</p>
        </div>
        <Button className="bg-gradient-gold shadow-gold hover:opacity-90" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Guest Pass
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Active Passes", value: String(activePassesCount), icon: QrCode, color: "text-primary" },
          { label: "Entries Today", value: "34", icon: CheckCircle, color: "text-emerald-600" },
          { label: "Denied Today", value: "2", icon: XCircle, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Expected visitors</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Active passes valid for the selected date (includes permanent passes).
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Date
            </label>
            <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Guest</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Host</th>
                <th className="px-3 py-2 font-medium">Code</th>
              </tr>
            </thead>
            <tbody>
              {expectedPasses.map((p) => {
                const host = p.residentName
                  ? `${p.residentName}${p.residentUnit ? ` · ${p.residentUnit}` : ""}`
                  : residents.find((r) => r.id === p.residentId)?.name ?? "—";
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground">{p.guestName}</td>
                    <td className="px-3 py-2 capitalize text-muted-foreground">{p.passType}</td>
                    <td className="px-3 py-2 text-muted-foreground">{host}</td>
                    <td className="px-3 py-2 font-mono text-xs">{p.code}</td>
                  </tr>
                );
              })}
              {expectedPasses.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No expected visitors for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ResidentPassesTable key={passesTableKey} />

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create guest pass (admin)">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Host resident
            </label>
            <Select
              value={hostResidentId}
              onChange={(e) => setHostResidentId(e.target.value)}
            >
              {activeResidents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · Unit {r.unit}
                </option>
              ))}
            </Select>
            {activeResidents.length === 0 && (
              <p className="text-xs text-destructive mt-2">
                No active residents available. Activate a resident first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Guest name
            </label>
            <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full name of guest" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Pass type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["single", "service", "permanent"] as PassType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setGuestType(t)}
                  className={`h-10 rounded-lg border text-xs font-semibold transition-colors ${
                    guestType === t ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t === "single" ? "Single" : t === "service" ? "Service" : "Permanent"}
                </button>
              ))}
            </div>
          </div>

          {guestType !== "permanent" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Date
                </label>
                <Input type="date" value={validDate} onChange={(e) => setValidDate(e.target.value)} />
              </div>
              {guestType === "service" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Start
                    </label>
                    <Input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      End
                    </label>
                    <Input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="flex items-end">
                  <p className="text-sm text-muted-foreground">Valid until 11:59 PM</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-gold shadow-gold hover:opacity-90"
              onClick={onCreate}
              disabled={!activeResidents.length}
            >
              Create pass
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

