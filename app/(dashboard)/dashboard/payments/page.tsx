"use client";

import { ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loadPayments,
  savePayments,
  type PaymentRecord,
  type PaymentStatus,
} from "@/components/dashboard/paymentsStore";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { pushResidentNotification } from "@/components/resident/store";
import type { ResidentNotification } from "@/components/resident/types";
import { loadResidents, type ResidentRecord } from "@/components/dashboard/residentsStore";
import {
  createAdminPaymentRequest,
  fetchAdminPayments,
  fetchAdminResidents,
  patchAdminPayment,
} from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<PaymentRecord | null>(null);
  const [page, setPage] = useState(1);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);

  const [typeDraft, setTypeDraft] = useState<string>("");
  const [statusDraft, setStatusDraft] = useState<PaymentStatus>("Pending");
  const [messageDraft, setMessageDraft] = useState<string>("");
  const [notifyResident, setNotifyResident] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createResidentId, setCreateResidentId] = useState("");
  const [createType, setCreateType] = useState<string>("Service Charge");
  const [createStatus, setCreateStatus] = useState<PaymentStatus>("Pending");
  const [createAmount, setCreateAmount] = useState<string>("");
  const [createDueDate, setCreateDueDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [createReference, setCreateReference] = useState<string>("");
  const [createNotes, setCreateNotes] = useState<string>("");
  const [createNotifyResident, setCreateNotifyResident] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (isApiMode()) {
        try {
          const [pay, res] = await Promise.all([fetchAdminPayments(), fetchAdminResidents()]);
          setPayments(pay);
          setResidents(res);
        } catch {
          setPayments([]);
          setResidents([]);
        }
        return;
      }
      setPayments(loadPayments());
      setResidents(loadResidents());
    };
    void load();
    const onStorage = (e: StorageEvent) => {
      if (isApiMode()) return;
      if (e.key === "estateos_payments_v1") setPayments(loadPayments());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    // When create modal opens, ensure it has a valid default resident.
    if (!createOpen) return;
    if (!createResidentId && residents.length > 0) setCreateResidentId(residents[0].id);
  }, [createOpen, createResidentId, residents]);

  useEffect(() => {
    if (!selected) return;
    setTypeDraft(selected.type);
    setStatusDraft(selected.status);
    setMessageDraft(selected.notes ?? "");
    setNotifyResident(true);
  }, [selected?.id]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return payments;
    return payments.filter(
      (p) =>
        p.residentName.toLowerCase().includes(query) ||
        p.unit.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query),
    );
  }, [payments, q]);

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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Payments & Billing</h1>
        <p className="text-sm text-muted-foreground">Track service charges, levies, and payment status.</p>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="bg-gradient-gold shadow-gold hover:opacity-90"
          onClick={() => {
            setCreateOpen(true);
            setCreating(false);
            setCreateType("Service Charge");
            setCreateStatus("Pending");
            setCreateAmount("");
            setCreateDueDate(new Date().toISOString().slice(0, 10));
            setCreateReference("");
            setCreateNotes("");
            setCreateNotifyResident(true);
          }}
        >
          Create payment
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collected", value: "₦3.5M", sub: "This month" },
          { label: "Outstanding", value: "₦1.2M", sub: "8 overdue" },
          { label: "Collection Rate", value: "74%", sub: "+5% vs last month" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold font-display text-foreground mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-600" /> {s.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search payments..."
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Resident</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Amount</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 hidden md:table-cell">Type</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 hidden md:table-cell">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelected(p)}
              >
                <td className="px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.residentName}</p>
                    <p className="text-xs text-muted-foreground">Unit {p.unit}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{p.amount}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">{p.type}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.status === "Paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : p.status === "Overdue"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">{p.dateLabel}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Payment details">
        {selected && (
          <div className="space-y-4">
            <div className="bg-background rounded-xl border border-border p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-foreground">{selected.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.residentName} · Unit {selected.unit}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-medium text-foreground">{selected.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground">{selected.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due/Date</p>
                  <p className="font-medium text-foreground">{selected.dateLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="font-medium text-foreground">{selected.reference ?? "—"}</p>
                </div>
              </div>

              {selected.notes && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm text-foreground mt-1 leading-relaxed">{selected.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin action & notifications
              </p>

              <div className="mt-3 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Payment type</p>
                  <Select value={typeDraft} onChange={(e) => setTypeDraft(e.target.value)}>
                    {Array.from(new Set(payments.map((p) => p.type)))
                      .filter(Boolean)
                      .map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    {/* allow custom type */}
                    <option value={typeDraft}>{typeDraft}</option>
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Status</p>
                  <Select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value as PaymentStatus)}>
                    {(["Paid", "Pending", "Overdue"] as PaymentStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Message / notes</p>
                <textarea
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  placeholder="Write an admin note. This is also used as the resident notification message."
                  className="w-full min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              </div>

              <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant={notifyResident ? "default" : "outline"}
                  className="justify-center"
                  onClick={() => setNotifyResident((v) => !v)}
                >
                  {notifyResident ? "Notify resident: On" : "Notify resident: Off"}
                </Button>

                <Button
                  type="button"
                  className="bg-gradient-gold shadow-gold hover:opacity-90"
                  onClick={() => {
                    if (!selected) return;
                    const defaultMsg = `Payment update: ${selected.residentName} - ${typeDraft} is now ${statusDraft}`;
                    const notes = messageDraft.trim() || undefined;

                    if (isApiMode()) {
                      void (async () => {
                        try {
                          const updated = await patchAdminPayment(selected.id, {
                            type: typeDraft.trim() || selected.type,
                            status: statusDraft,
                            notes,
                          });
                          setPayments((prev) => prev.map((p) => (p.id === selected.id ? updated : p)));
                          setSelected(updated);
                        } catch {
                          /* ignore */
                        }
                      })();
                      return;
                    }

                    const nextPayment: PaymentRecord = {
                      ...selected,
                      type: typeDraft.trim() || selected.type,
                      status: statusDraft,
                      notes,
                    };

                    const next = payments.map((p) => (p.id === selected.id ? nextPayment : p));
                    savePayments(next);
                    setPayments(next);
                    setSelected(nextPayment);

                    if (notifyResident && selected.residentId) {
                      const n: ResidentNotification["type"] = "payment";
                      pushResidentNotification({
                        residentId: selected.residentId,
                        type: n,
                        message: messageDraft.trim() || defaultMsg,
                      });
                    }
                  }}
                >
                  Save & notify
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={createOpen}
        onClose={() => {
          if (creating) return;
          setCreateOpen(false);
        }}
        title="Create payment"
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Resident</p>
              <Select value={createResidentId} onChange={(e) => setCreateResidentId(e.target.value)}>
                <option value="" disabled>
                  Select resident
                </option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} · Unit {r.unit}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Status</p>
              <Select value={createStatus} onChange={(e) => setCreateStatus(e.target.value as PaymentStatus)}>
                {(["Paid", "Pending", "Overdue"] as PaymentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Payment type</p>
              <Input value={createType} onChange={(e) => setCreateType(e.target.value)} placeholder="Service Charge, Maintenance..." />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Due date</p>
              <Input type="date" value={createDueDate} onChange={(e) => setCreateDueDate(e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Amount</p>
              <Input value={createAmount} onChange={(e) => setCreateAmount(e.target.value)} placeholder="₦250,000" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Reference (optional)</p>
              <Input value={createReference} onChange={(e) => setCreateReference(e.target.value)} placeholder="e.g. INV-23100" />
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Notes (optional)</p>
            <textarea
              value={createNotes}
              onChange={(e) => setCreateNotes(e.target.value)}
              placeholder="Admin note / billing explanation"
              className="w-full min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notify resident</p>
                <p className="text-xs text-muted-foreground mt-1">Creates a resident notification.</p>
              </div>
              <Button
                type="button"
                variant={createNotifyResident ? "default" : "outline"}
                onClick={() => setCreateNotifyResident((v) => !v)}
              >
                {createNotifyResident ? "On" : "Off"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-gradient-gold shadow-gold hover:opacity-90"
              disabled={
                creating ||
                !createResidentId ||
                createAmount.trim().length === 0 ||
                createType.trim().length === 0 ||
                !createDueDate
              }
              onClick={() => {
                if (!createResidentId) return;
                const resident = residents.find((r) => r.id === createResidentId);
                if (!resident) return;

                const dateObj = createDueDate ? new Date(createDueDate) : new Date();
                const dateLabel = dateObj.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const reference = createReference.trim() || `INV-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

                if (isApiMode()) {
                  setCreating(true);
                  void (async () => {
                    try {
                      const nextPayment = await createAdminPaymentRequest({
                        residentId: resident.id,
                        amount: createAmount.trim(),
                        type: createType.trim(),
                        notes: createNotes.trim() || undefined,
                        status: createStatus,
                        dateLabel,
                        reference,
                      });
                      setPayments((prev) => [nextPayment, ...prev]);
                      setSelected(nextPayment);
                      setCreateOpen(false);
                      if (createNotifyResident) {
                        pushResidentNotification({
                          residentId: resident.id,
                          type: "payment",
                          message: `Payment created: ${nextPayment.type}\nAmount: ${nextPayment.amount}\nDue: ${nextPayment.dateLabel}\nStatus: ${nextPayment.status}`,
                        });
                      }
                    } catch {
                      /* ignore */
                    } finally {
                      setCreating(false);
                    }
                  })();
                  return;
                }

                const nowTs = Date.now();
                const id = `pay_${resident.id}_${nowTs}`;
                const nextPayment: PaymentRecord = {
                  id,
                  residentId: resident.id,
                  residentName: resident.name,
                  unit: resident.unit,
                  amount: createAmount.trim(),
                  type: createType.trim(),
                  status: createStatus,
                  dateLabel,
                  createdAt: nowTs,
                  reference,
                  notes: createNotes.trim() || undefined,
                };

                setCreating(true);
                try {
                  const next = [nextPayment, ...payments];
                  savePayments(next);
                  setPayments(next);
                  setSelected(nextPayment);
                  setCreateOpen(false);

                  if (createNotifyResident) {
                    pushResidentNotification({
                      residentId: resident.id,
                      type: "payment",
                      message: `Payment created: ${nextPayment.type}\nAmount: ${nextPayment.amount}\nDue: ${nextPayment.dateLabel}\nStatus: ${nextPayment.status}`,
                    });
                  }
                } finally {
                  setCreating(false);
                }
              }}
            >
              {creating ? "Creating..." : "Create payment"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

