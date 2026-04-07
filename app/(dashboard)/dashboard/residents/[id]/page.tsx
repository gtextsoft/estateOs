"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, Building2, CreditCard, QrCode } from "lucide-react";
import {
  loadResidents,
  saveResidents,
  type ResidentRecord,
} from "@/components/dashboard/residentsStore";
import { Button } from "@/components/ui/button";
import { revokePassesForResident } from "@/components/resident/store";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import type { GuestPass } from "@/components/resident/types";
import { loadPasses, passTypeLabel } from "@/components/resident/store";
import type { IncidentRecord } from "@/components/dashboard/incidentsStore";
import { loadIncidents } from "@/components/dashboard/incidentsStore";
import type { PaymentRecord } from "@/components/dashboard/paymentsStore";
import { loadPayments } from "@/components/dashboard/paymentsStore";

export default function ResidentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [hubTab, setHubTab] = useState<"passes" | "payments" | "incidents">(
    "passes",
  );
  const [selected, setSelected] = useState<
    | { kind: "pass"; item: GuestPass }
    | { kind: "incident"; item: IncidentRecord }
    | { kind: "payment"; item: PaymentRecord }
    | null
  >(null);
  const [passes, setPasses] = useState<GuestPass[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [passesPage, setPassesPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [incidentsPage, setIncidentsPage] = useState(1);

  useEffect(() => {
    setResidents(loadResidents());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "estateos_residents_v1") setResidents(loadResidents());
      if (e.key === "estateos_resident_passes_v1") setPasses(loadPasses());
      if (e.key === "estateos_incidents_v1") setIncidents(loadIncidents());
      if (e.key === "estateos_payments_v1") setPayments(loadPayments());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const r = useMemo(() => residents.find((x) => x.id === id), [residents, id]);
  const rId = r?.id ?? "";

  useEffect(() => {
    setPasses(loadPasses());
    setIncidents(loadIncidents());
    setPayments(loadPayments());
  }, []);

  const residentPasses = useMemo(
    () => passes.filter((p) => p.residentId === rId),
    [passes, rId],
  );
  const residentIncidents = useMemo(
    () => incidents.filter((i) => i.residentId === rId),
    [incidents, rId],
  );
  const residentPayments = useMemo(
    () => payments.filter((p) => p.residentId === rId),
    [payments, rId],
  );

  const pageSize = 8;
  const passesPageCount = Math.max(1, Math.ceil(residentPasses.length / pageSize));
  const paymentsPageCount = Math.max(1, Math.ceil(residentPayments.length / pageSize));
  const incidentsPageCount = Math.max(1, Math.ceil(residentIncidents.length / pageSize));

  const passesSafePage = Math.min(passesPage, passesPageCount);
  const paymentsSafePage = Math.min(paymentsPage, paymentsPageCount);
  const incidentsSafePage = Math.min(incidentsPage, incidentsPageCount);

  const passesRows = useMemo(() => {
    const start = (passesSafePage - 1) * pageSize;
    return residentPasses.slice(start, start + pageSize);
  }, [residentPasses, passesSafePage]);

  const paymentsRows = useMemo(() => {
    const start = (paymentsSafePage - 1) * pageSize;
    return residentPayments.slice(start, start + pageSize);
  }, [residentPayments, paymentsSafePage]);

  const incidentsRows = useMemo(() => {
    const start = (incidentsSafePage - 1) * pageSize;
    return residentIncidents.slice(start, start + pageSize);
  }, [residentIncidents, incidentsSafePage]);

  if (!r) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Resident not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This resident does not exist.
        </p>
        <Link
          href="/dashboard/residents"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to Residents
        </Link>
      </div>
    );
  }

  const approve = () => {
    const next = residents.map((x) =>
      x.id === r.id ? { ...x, status: "Active" as const } : x,
    );
    setResidents(next);
    saveResidents(next);
  };

  const deactivate = () => {
    const next = residents.map((x) =>
      x.id === r.id ? { ...x, status: "Inactive" as const } : x,
    );
    setResidents(next);
    saveResidents(next);
    revokePassesForResident(r.id);
  };

  const reactivate = () => {
    const next = residents.map((x) =>
      x.id === r.id ? { ...x, status: "Active" as const } : x,
    );
    setResidents(next);
    saveResidents(next);
  };

  const statusPill =
    r.status === "Active"
      ? { cls: "bg-emerald-100 text-emerald-700", label: "Active" }
      : r.status === "Pending"
        ? { cls: "bg-amber-100 text-amber-700", label: "Pending" }
        : { cls: "bg-secondary text-muted-foreground", label: "Inactive" };

  const statusHelp =
    r.status === "Active"
      ? "This resident can access resident features."
      : r.status === "Pending"
        ? "Pending residents should be approved before access is granted."
        : "Inactive residents are blocked from creating guest passes; existing passes are revoked.";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {r.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Resident profile and related activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {r.status === "Pending" && (
            <Button
              className="bg-gradient-gold shadow-gold hover:opacity-90"
              onClick={approve}
            >
              Approve resident
            </Button>
          )}
          {r.status === "Inactive" && (
            <Button
              className="bg-gradient-gold shadow-gold hover:opacity-90"
              onClick={reactivate}
            >
              Reactivate
            </Button>
          )}
          {r.status !== "Inactive" && (
            <Button variant="outline" onClick={deactivate}>
              Deactivate
            </Button>
          )}
          <Link
            href="/dashboard/residents"
            className="text-sm font-medium text-primary hover:underline"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-10">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Unit {r.unit}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-0">{statusHelp}</p>
            </div>

            <div className="mt-0">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusPill.cls}`}
              >
                {statusPill.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{r.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Member since</p>
            <p className="font-medium text-foreground">{r.since}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Resident records
            </h3>
            <p className="text-sm text-muted-foreground">
              Toggle between related guest passes, payments and incidents.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="inline-flex w-full sm:w-auto rounded-lg border border-border bg-background p-1">
              {(
                [
                  { key: "passes", label: `Passes (${residentPasses.length})` },
                  {
                    key: "payments",
                    label: `Payments (${residentPayments.length})`,
                  },
                  {
                    key: "incidents",
                    label: `Incidents (${residentIncidents.length})`,
                  },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setHubTab(t.key)}
                  className={`flex-1 sm:flex-none px-3 h-9 rounded-md text-xs font-semibold transition-colors ${
                    hubTab === t.key
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {hubTab === "passes" && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">
                    Visitor
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5 hidden md:table-cell">
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
                {passesRows.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelected({ kind: "pass", item: p });
                    }}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <QrCode className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {p.guestName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            ID: {p.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 hidden md:table-cell">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {passTypeLabel(p.passType)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground hidden md:table-cell">
                      {p.validUntilLabel}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : p.status === "used"
                              ? "bg-secondary text-muted-foreground"
                              : p.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {residentPasses.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      No guest passes for this resident.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {hubTab === "payments" && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">
                    Type
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">
                    Amount
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5 hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paymentsRows.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelected({ kind: "payment", item: p });
                    }}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {p.type}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {p.reference ?? p.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-foreground">
                      {p.amount}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground hidden md:table-cell">
                      {p.dateLabel}
                    </td>
                    <td className="px-6 py-3.5">
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
                  </tr>
                ))}
                {residentPayments.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      No payments linked to this resident.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {hubTab === "incidents" && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">
                    Title
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5 hidden md:table-cell">
                    Severity
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5 hidden md:table-cell">
                    When
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {incidentsRows.map((i) => (
                  <tr
                    key={i.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelected({ kind: "incident", item: i });
                    }}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            i.severity === "High"
                              ? "bg-destructive/10"
                              : i.severity === "Medium"
                                ? "bg-amber-100"
                                : "bg-muted"
                          }`}
                        >
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              i.severity === "High"
                                ? "text-destructive"
                                : i.severity === "Medium"
                                  ? "text-amber-700"
                                  : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {i.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Reported by {i.reporter}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground hidden md:table-cell">
                      {i.severity}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground hidden md:table-cell">
                      {i.timeLabel}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          i.status === "Resolved"
                            ? "bg-emerald-100 text-emerald-700"
                            : i.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : i.status === "Investigating"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {residentIncidents.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      No incidents linked to this resident.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 pb-5">
          {hubTab === "passes" && (
            <Pagination
              page={passesSafePage}
              pageCount={passesPageCount}
              onPageChange={setPassesPage}
            />
          )}
          {hubTab === "payments" && (
            <Pagination
              page={paymentsSafePage}
              pageCount={paymentsPageCount}
              onPageChange={setPaymentsPage}
            />
          )}
          {hubTab === "incidents" && (
            <Pagination
              page={incidentsSafePage}
              pageCount={incidentsPageCount}
              onPageChange={setIncidentsPage}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={
          selected?.kind === "pass"
            ? "Guest pass details"
            : selected?.kind === "payment"
              ? "Payment details"
              : selected?.kind === "incident"
                ? "Incident details"
                : "Details"
        }
      >
        {selected?.kind === "pass" && (
          <div className="bg-background rounded-xl border border-border p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-foreground">
                  {selected.item.guestName}
                </p>
                <p className="text-sm text-muted-foreground">ID: {selected.item.id}</p>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Entry type</p>
                <p className="font-medium text-foreground">{passTypeLabel(selected.item.passType)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium text-foreground">{selected.item.status}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valid</p>
                <p className="font-medium text-foreground">{selected.item.validUntilLabel}</p>
              </div>
            </div>
          </div>
        )}

        {selected?.kind === "incident" && (
          <div className="bg-background rounded-xl border border-border p-5">
            <div className="flex items-start gap-3">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selected.item.severity === "High"
                    ? "bg-destructive/10"
                    : selected.item.severity === "Medium"
                      ? "bg-amber-100"
                      : "bg-muted"
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${
                    selected.item.severity === "High"
                      ? "text-destructive"
                      : selected.item.severity === "Medium"
                        ? "text-amber-700"
                        : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-foreground">{selected.item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selected.item.status} · {selected.item.timeLabel}
                </p>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Severity</p>
                <p className="font-medium text-foreground">{selected.item.severity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reporter</p>
                <p className="font-medium text-foreground">{selected.item.reporter}</p>
              </div>
            </div>
            {selected.item.description && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Details</p>
                <p className="text-sm text-foreground mt-1 leading-relaxed">{selected.item.description}</p>
              </div>
            )}
          </div>
        )}

        {selected?.kind === "payment" && (
          <div className="bg-background rounded-xl border border-border p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-foreground">{selected.item.type}</p>
                <p className="text-sm text-muted-foreground">
                  {selected.item.amount} · {selected.item.status}
                </p>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Due/Date</p>
                <p className="font-medium text-foreground">{selected.item.dateLabel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="font-medium text-foreground">{selected.item.reference ?? "—"}</p>
              </div>
            </div>
            {selected.item.notes && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm text-foreground mt-1 leading-relaxed">{selected.item.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
