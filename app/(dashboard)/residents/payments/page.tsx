"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getCurrentResidentId, pushResidentNotification } from "@/components/resident/store";
import { loadPayments, savePayments, type PaymentRecord, type PaymentStatus } from "@/components/dashboard/paymentsStore";
import { loadResidents, type ResidentRecord } from "@/components/dashboard/residentsStore";
import { createPaymentRequestApi, fetchMyPayments, fetchMyProfile } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

function paymentBadgeVariant(s: PaymentStatus) {
  if (s === "Paid") return "active";
  if (s === "Pending") return "pending";
  return "revoked";
}

export default function ResidentPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PaymentRecord | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState("Service Charge");
  const [createAmount, setCreateAmount] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [resident, setResident] = useState<ResidentRecord | null>(null);

  useEffect(() => {
    const sync = async () => {
      if (isApiMode()) {
        try {
          const [p, prof] = await Promise.all([fetchMyPayments(), fetchMyProfile()]);
          setPayments(p);
          setResident(prof);
        } catch {
          setPayments([]);
          setResident(null);
        }
        return;
      }
      setPayments(loadPayments().filter((p) => p.residentId === getCurrentResidentId()));
      setResident(loadResidents().find((r) => r.id === getCurrentResidentId()) ?? null);
    };
    void sync();
    const onStorage = (e: StorageEvent) => {
      if (isApiMode()) return;
      if (e.key === "estateos_payments_v1") void sync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...payments].sort((a, b) => b.createdAt - a.createdAt);
    return [...payments]
      .filter(
        (p) =>
          p.type.toLowerCase().includes(q) ||
          p.amount.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q) ||
          (p.reference ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [payments, query]);

  const createPaymentRequest = () => {
    if (!resident) return;
    if (!createType.trim() || !createAmount.trim()) return;

    if (isApiMode()) {
      void (async () => {
        try {
          const nextPayment = await createPaymentRequestApi({
            type: createType.trim(),
            amount: createAmount.trim(),
            notes: createNotes.trim() || undefined,
          });
          setPayments((prev) => [nextPayment, ...prev]);
          setCreateOpen(false);
          setSelected(nextPayment);
          setCreateAmount("");
          setCreateNotes("");
          setCreateType("Service Charge");
        } catch {
          /* ignore */
        }
      })();
      return;
    }

    const nowTs = Date.now();
    const dateLabel = new Date(nowTs).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const id = `pay_res_${nowTs}_${Math.random().toString(16).slice(2, 6)}`;
    const nextPayment: PaymentRecord = {
      id,
      residentId: resident.id,
      residentName: resident.name,
      unit: resident.unit,
      amount: createAmount.trim(),
      type: createType.trim(),
      status: "Pending",
      dateLabel,
      createdAt: nowTs,
      reference: `REQ-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
      notes: createNotes.trim() || undefined,
    };
    const next = [nextPayment, ...payments];
    savePayments(next);
    setPayments(next);
    pushResidentNotification({
      residentId: resident.id,
      type: "payment",
      message: `Payment request submitted: ${nextPayment.type} (${nextPayment.amount})`,
    });
    setCreateOpen(false);
    setSelected(nextPayment);
    setCreateAmount("");
    setCreateNotes("");
    setCreateType("Service Charge");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-card rounded-xl border border-border shadow-soft">
        <div className="p-5 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground">My Payments</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} records</p>
          </div>
          <div className="w-full sm:max-w-sm flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search payments..." />
            <Button className="bg-gradient-gold shadow-gold hover:opacity-90" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        <div className="p-5">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No payment records found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                    <th className="px-3 py-2 font-medium">Due</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-border hover:bg-muted/40 cursor-pointer"
                      onClick={() => setSelected(p)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelected(p);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <td className="px-3 py-2 text-foreground">{p.type}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{p.amount}</td>
                      <td className="px-3 py-2 text-muted-foreground">{p.dateLabel}</td>
                      <td className="px-3 py-2">
                        <Badge variant={paymentBadgeVariant(p.status) as any}>{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.type ?? "Payment"}>
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={paymentBadgeVariant(selected.status) as any}>{selected.status}</Badge>
              <span className="text-xs text-muted-foreground">
                Due: <span className="font-medium text-foreground">{selected.dateLabel}</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</p>
                <p className="mt-2 text-sm font-medium text-foreground">{selected.amount}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reference</p>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm font-mono text-foreground break-all">{selected.reference ?? "—"}</span>
                  {selected.reference ? (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(selected.reference ?? "");
                          setCopiedRef(true);
                          window.setTimeout(() => setCopiedRef(false), 1500);
                        } catch {
                          // ignore clipboard failures in demo mode
                        }
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                      {copiedRef && <span className="ml-2 text-xs font-semibold text-primary">Copied!</span>}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</p>
              <p className="mt-2 text-sm text-foreground leading-relaxed">{selected.notes ?? "No notes provided."}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create payment request">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment type</label>
            <Input value={createType} onChange={(e) => setCreateType(e.target.value)} placeholder="e.g. Service Charge" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Amount</label>
            <Input value={createAmount} onChange={(e) => setCreateAmount(e.target.value)} placeholder="e.g. ₦50,000" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes (optional)</label>
            <textarea
              value={createNotes}
              onChange={(e) => setCreateNotes(e.target.value)}
              placeholder="Add details for admin review..."
              className="w-full min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-gold shadow-gold hover:opacity-90" onClick={createPaymentRequest}>
              Submit request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
