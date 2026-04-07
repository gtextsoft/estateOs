"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Clock,
  Download,
  MoreVertical,
  Plus,
  QrCode,
  Shield,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { QrCodeDisplay } from "@/components/ui/QrCodeDisplay";
import type { GuestPass, PassType } from "@/components/resident/types";
import {
  getCurrentResidentId,
  loadNotifications,
  loadPasses,
  pushResidentNotification,
  passStatusBadgeVariant,
  passTypeLabel,
  savePasses,
} from "@/components/resident/store";
import {
  createGuestPassRequest,
  createPaymentRequestApi,
  fetchMyIncidents,
  fetchMyGuestPasses,
  fetchMyNotifications,
  fetchMyPayments,
  fetchMyProfile,
  revokeGuestPassRequest,
} from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";
import type { ResidentNotification } from "@/components/resident/types";
import {
  loadResidents,
  type ResidentRecord,
} from "@/components/dashboard/residentsStore";
import {
  loadPayments,
  savePayments,
  type PaymentRecord,
  type PaymentStatus,
} from "@/components/dashboard/paymentsStore";
import {
  loadIncidents,
  type IncidentRecord,
  type IncidentSeverity,
  type IncidentStatus,
} from "@/components/dashboard/incidentsStore";

function nextPassId(existing: GuestPass[]) {
  const nums = existing
    .map((p) => Number(p.id.replace(/^GPA-/, "")))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `GPA-${String(next).padStart(3, "0")}`;
}

function paymentBadgeVariant(s: PaymentStatus) {
  if (s === "Paid") return "active";
  if (s === "Pending") return "pending";
  return "revoked";
}

function incidentSeverityDot(sev: IncidentSeverity) {
  if (sev === "Low") return "bg-emerald-500";
  if (sev === "Medium") return "bg-amber-500";
  return "bg-red-500";
}

function incidentStatusPillClass(status: IncidentStatus) {
  if (status === "Open") return "bg-amber-100 text-amber-700";
  if (status === "Investigating") return "bg-amber-100 text-amber-700";
  if (status === "In Progress") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

const OVERVIEW_TABLE_LIMIT = 5;

export default function ResidentPortalPage() {
  const [passes, setPasses] = useState<GuestPass[]>([]);
  const [notifications, setNotifications] = useState<ResidentNotification[]>(
    [],
  );
  const [resident, setResident] = useState<ResidentRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<GuestPass | null>(null);
  const [origin, setOrigin] = useState<string>("");

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [createPaymentOpen, setCreatePaymentOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<string>("Service Charge");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Pending");

  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
    null,
  );
  const [copiedPaymentRef, setCopiedPaymentRef] = useState(false);
  const [copiedResidentCode, setCopiedResidentCode] = useState(false);

  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [selectedIncident, setSelectedIncident] =
    useState<IncidentRecord | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestType, setGuestType] = useState<PassType>("single");
  const [validDate, setValidDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("17:00");
  const [query, setQuery] = useState("");

  const [panicHolding, setPanicHolding] = useState(false);
  const [panicSent, setPanicSent] = useState(false);
  const [panicTimer, setPanicTimer] = useState(0);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    const rid = getCurrentResidentId();
    const load = async () => {
      if (isApiMode()) {
        try {
          const [prof, notifs, gp, pay, inc] = await Promise.all([
            fetchMyProfile(),
            fetchMyNotifications(),
            fetchMyGuestPasses(),
            fetchMyPayments(),
            fetchMyIncidents(),
          ]);
          setResident(prof);
          setNotifications(notifs);
          setPasses(gp);
          setPayments(pay);
          setIncidents(inc);
        } catch {
          setResident(null);
          setNotifications([]);
          setPasses([]);
          setPayments([]);
          setIncidents([]);
        }
        setOrigin(window.location.origin);
        return;
      }
      setPasses(loadPasses());
      setNotifications(loadNotifications().filter((n) => n.residentId === rid));
      const all = loadResidents();
      setResident(all.find((r) => r.id === rid) ?? null);
      setPayments(loadPayments().filter((p) => p.residentId === rid));
      setIncidents(loadIncidents().filter((i) => i.residentId === rid));
      setOrigin(window.location.origin);
    };
    void load();
  }, []);

  const allowedIncidentStatusesForPayment = ["In Progress", "Resolved"];
  const eligibleIncidentNotice = useMemo(() => {
    return notifications.find(
      (n) =>
        n.type === "notice" &&
        typeof n.meta?.incidentStatus === "string" &&
        allowedIncidentStatusesForPayment.includes(n.meta.incidentStatus),
    );
  }, [notifications]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (isApiMode()) return;
      const rid = getCurrentResidentId();
      if (e.key === "estateos_residents_v1") {
        const all = loadResidents();
        setResident(all.find((r) => r.id === rid) ?? null);
      }
      if (e.key === "estateos_resident_passes_v1") {
        setPasses(loadPasses());
      }
      if (e.key === "estateos_resident_notifications_v1") {
        setNotifications(loadNotifications().filter((n) => n.residentId === rid));
      }
      if (e.key === "estateos_payments_v1") {
        setPayments(loadPayments().filter((p) => p.residentId === rid));
      }
      if (e.key === "estateos_incidents_v1") {
        setIncidents(loadIncidents().filter((i) => i.residentId === rid));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuFor(null);
    };
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-pass-menu-root]")) setMenuFor(null);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  useEffect(() => {
    if (isApiMode()) return;
    if (!passes.length) return;
    savePasses(passes);
  }, [passes]);

  const filteredPasses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return passes;
    return passes.filter(
      (p) =>
        p.guestName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    );
  }, [passes, query]);

  const paymentPreview = useMemo(
    () =>
      [...payments]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, OVERVIEW_TABLE_LIMIT),
    [payments],
  );
  const incidentPreview = useMemo(
    () =>
      [...incidents]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, OVERVIEW_TABLE_LIMIT),
    [incidents],
  );

  const activeCount = useMemo(
    () => passes.filter((p) => p.status === "active").length,
    [passes],
  );

  const startPanic = () => {
    if (panicHolding || panicSent) return;
    setPanicHolding(true);
    setPanicTimer(0);
    let t = 0;
    const interval = window.setInterval(() => {
      t += 1;
      setPanicTimer(t);
      if (t >= 3) {
        window.clearInterval(interval);
        setPanicSent(true);
        setPanicHolding(false);
        window.setTimeout(() => {
          setPanicSent(false);
          setPanicTimer(0);
        }, 2500);
      }
    }, 1000);
  };

  const stopPanic = () => {
    if (panicSent) return;
    setPanicHolding(false);
    setPanicTimer(0);
  };

  const createPass = () => {
    if (resident?.status === "Inactive") return;
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

    const finishLocal = () => {
      const id = nextPassId(passes);
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
      setPasses((prev) => [newPass, ...prev]);
      setSelectedPass(newPass);
    };

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
          /* keep modal open */
        }
      })();
    } else {
      finishLocal();
    }

    setGuestName("");
    setGuestType("single");
    setValidDate(new Date().toISOString().slice(0, 10));
    setCreateOpen(false);
  };

  const revokeSelected = () => {
    if (!selectedPass) return;
    setPasses((prev) =>
      prev.map((p) =>
        p.id === selectedPass.id ? { ...p, status: "revoked" } : p,
      ),
    );
    setSelectedPass((p) => (p ? { ...p, status: "revoked" } : p));
  };

  const shareSelected = async () => {
    if (!selectedPass) return;
    const text = `EstateOS Guest Pass\nID: ${selectedPass.id}\nGuest: ${selectedPass.guestName}\nType: ${passTypeLabel(selectedPass.passType)}\nValid: ${selectedPass.validUntilLabel}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const sharePass = async (p: GuestPass) => {
    const text = `EstateOS Guest Pass\nID: ${p.id}\nGuest: ${p.guestName}\nType: ${passTypeLabel(p.passType)}\nValid: ${p.validUntilLabel}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const revokePassById = (id: string) => {
    if (isApiMode()) {
      void (async () => {
        try {
          await revokeGuestPassRequest(id);
          setPasses((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: "revoked" as const } : p)),
          );
          setSelectedPass((p) =>
            p && p.id === id ? { ...p, status: "revoked" } : p,
          );
        } catch {
          /* ignore */
        }
      })();
      return;
    }
    setPasses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "revoked" } : p)),
    );
    setSelectedPass((p) =>
      p && p.id === id ? { ...p, status: "revoked" } : p,
    );
  };

  const residentCode = resident?.code ?? resident?.id ?? "";

  const copyResidentCode = async () => {
    if (!residentCode) return;
    try {
      await navigator.clipboard.writeText(residentCode);
      setCopiedResidentCode(true);
      window.setTimeout(() => setCopiedResidentCode(false), 1400);
    } catch {
      // ignore clipboard failures in demo mode
    }
  };

  const downloadResidentCode = async () => {
    if (!residentCode || !resident) return;
    try {
      const qrValue = origin
        ? `${origin}/dashboard/security?code=${encodeURIComponent(residentCode)}`
        : residentCode;
      const dataUrl = await QRCode.toDataURL(qrValue, {
        width: 512,
        margin: 1,
        errorCorrectionLevel: "M",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `resident-${residentCode}-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      // ignore QR generation failures in demo mode
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="flex flex-col space-y-6">
          <div
            id="home"
            className="scroll-mt-6 rounded-2xl border border-border bg-gradient-cream p-6 flex items-center justify-between gap-6"
          >
            <div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                Good afternoon
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {resident?.name ?? "Resident"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {resident ? `Unit ${resident.unit}` : "—"} · {activeCount}{" "}
                active guest pass
                {activeCount === 1 ? "" : "es"}
              </p>
              <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2.5 w-fit min-w-[220px]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Resident code:
                  </span>
                  <span className="text-xs font-mono font-medium text-foreground break-all">
                    {residentCode || "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    className="h-7 w-7 rounded-md hover:bg-muted inline-flex items-center justify-center"
                    onClick={copyResidentCode}
                    aria-label="Copy resident code"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="h-7 w-7 rounded-md hover:bg-muted inline-flex items-center justify-center"
                    onClick={downloadResidentCode}
                    aria-label="Download resident QR code"
                  >
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <span
                    className={`text-[11px] font-semibold transition-all duration-200 ${
                      copiedResidentCode
                        ? "text-primary opacity-100 translate-y-0"
                        : "text-primary/0 opacity-0 -translate-y-0.5"
                    }`}
                    aria-live="polite"
                  >
                    Copied!
                  </span>
                </div>
              </div>
            </div>
            <Button
              className="bg-gradient-gold shadow-gold hover:opacity-90"
              onClick={() => setCreateOpen(true)}
              disabled={resident?.status === "Inactive"}
            >
              <Plus className="h-4 w-4 mr-2" /> Create Guest Pass
            </Button>
          </div>

          {resident?.status === "Inactive" && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              This resident is deactivated. Guest pass creation is disabled and
              existing passes are revoked.
            </div>
          )}

          <div
            id="guest-passes"
            className="grid h-full scroll-mt-6 bg-card rounded-xl border border-border shadow-soft"
          >
            <div className="p-5 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  My Guest Passes
                </h3>
                <p className="text-sm text-muted-foreground">
                  {passes.length} passes · {activeCount} active
                </p>
              </div>
              <div className="relative w-full sm:max-w-sm">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search passes..."
                />
              </div>
            </div>

            <div className="p-5 space-y-3">
              {filteredPasses.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPass(p)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedPass(p);
                  }}
                  className="w-full text-left bg-background rounded-xl border border-border p-4 shadow-soft hover:shadow-card transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                      {p.passType === "permanent" ? (
                        <User className="h-5 w-5 text-primary" />
                      ) : p.passType === "service" ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <QrCode className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-base font-semibold text-foreground truncate">
                          {p.guestName}
                        </p>
                        <Badge
                          variant={passStatusBadgeVariant(p.status) as any}
                        >
                          {passTypeLabel(p.passType)}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {p.validUntilLabel}
                      </div>
                    </div>

                    <div className="text-xs font-mono text-muted-foreground shrink-0">
                      ID: {p.id}
                    </div>
                    <QrCode className="h-4 w-4 text-muted-foreground shrink-0" />

                    <div className="relative shrink-0" data-pass-menu-root>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
                        aria-label="Pass actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuFor((cur) => (cur === p.id ? null : p.id));
                        }}
                      >
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>

                      {menuFor === p.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-card overflow-hidden z-20">
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuFor(null);
                              setSelectedPass(p);
                            }}
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onClick={async (e) => {
                              e.stopPropagation();
                              setMenuFor(null);
                              await sharePass(p);
                            }}
                          >
                            Share (copy)
                          </button>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={p.status === "revoked"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuFor(null);
                              revokePassById(p.id);
                            }}
                          >
                            Revoke
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            id="emergency"
            className="scroll-mt-6 bg-card rounded-xl border border-border shadow-soft p-6 text-center"
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Emergency
            </div>

            {panicSent ? (
              <div>
                <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
                <div className="text-sm font-semibold text-emerald-700">
                  Alert Sent!
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Guard post notified (demo).
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className={`mx-auto h-24 w-24 rounded-full border-[3px] flex flex-col items-center justify-center transition-colors ${
                    panicHolding
                      ? "border-destructive bg-destructive/10"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                  onMouseDown={startPanic}
                  onMouseUp={stopPanic}
                  onMouseLeave={stopPanic}
                  onTouchStart={startPanic}
                  onTouchEnd={stopPanic}
                  aria-label="Panic button hold"
                >
                  <AlertTriangle className="h-7 w-7 text-destructive" />
                  {panicHolding && (
                    <div className="text-lg font-black text-destructive">
                      {3 - panicTimer}
                    </div>
                  )}
                </button>
                <div className="mt-3 text-sm font-semibold text-foreground">
                  Panic Button
                </div>
                <div className="text-xs text-muted-foreground">
                  {panicHolding
                    ? "Keep holding..."
                    : "Hold for 3 seconds to alert security"}
                </div>
              </>
            )}
          </div>

          <div
            id="notifications"
            className="scroll-mt-6 bg-card rounded-xl border border-border shadow-soft"
          >
            <div className="p-5 border-b border-border">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Notifications
              </h3>
              <p className="text-sm text-muted-foreground">
                Recent updates (demo).
              </p>
            </div>
            <div className="p-5 space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 ${n.read ? "opacity-60" : ""}`}
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full ${n.read ? "bg-muted-foreground" : "bg-primary"}`}
                  />
                  <div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {n.timeLabel}
                    </p>
                  </div>
                </div>
              ))}

              {eligibleIncidentNotice && (
                <div className="mt-2 rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Create payment
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Privilege unlocked from incident status:{" "}
                    <span className="font-medium text-foreground">
                      {eligibleIncidentNotice.meta?.incidentStatus}
                    </span>
                  </p>
                  <Button
                    className="mt-3 w-full bg-gradient-gold shadow-gold hover:opacity-90"
                    onClick={() => {
                      setPaymentType("Service Charge");
                      setPaymentAmount("");
                      setPaymentNotes("");
                      setPaymentStatus("Pending");
                      setCreatePaymentOpen(true);
                    }}
                  >
                    Submit payment request
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-14 pt-2 space-y-6">
        {/* <div className="rounded-xl border border-border/70 bg-gradient-cream px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Overview details
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent payment and incident activity for quick review.
          </p>
        </div> */}
        <div
          id="payments"
          className="scroll-mt-6 h-full bg-card rounded-xl border border-border shadow-soft"
        >
          <div className="p-5 border-b border-border flex items-center justify-between gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Payments
              </h3>
              <span className="text-xs text-muted-foreground">
                {payments.length} request{payments.length === 1 ? "" : "s"}
              </span>
              <span className="text-xs text-muted-foreground">
                Showing first {Math.min(OVERVIEW_TABLE_LIMIT, paymentPreview.length)}
              </span>
            </div>
            <Link
              href="/residents/payments"
              className="text-sm font-medium text-primary hover:underline"
            >
              View more
            </Link>
          </div>
          <div className="p-5">
            {paymentPreview.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No payment requests found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Amount</th>
                      <th className="px-3 py-2 font-medium">Due</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentPreview.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-border/80 hover:bg-primary/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedPayment(p)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setSelectedPayment(p);
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        <td className="px-3 py-2 text-foreground">{p.type}</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">
                          {p.amount}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {p.dateLabel}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={paymentBadgeVariant(p.status) as any}>
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div
          id="incidents"
          className="scroll-mt-6 bg-card rounded-xl border border-border shadow-soft"
        >
          <div className="p-5 border-b border-border flex items-center justify-between gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Incidents
              </h3>
              <span className="text-xs text-muted-foreground">
                {incidents.length} incident{incidents.length === 1 ? "" : "s"}
              </span>
              <span className="text-xs text-muted-foreground">
                Showing first {Math.min(OVERVIEW_TABLE_LIMIT, incidentPreview.length)}
              </span>
            </div>
            <Link
              href="/residents/incidents"
              className="text-sm font-medium text-primary hover:underline"
            >
              View more
            </Link>
          </div>
          <div className="p-5">
            {incidentPreview.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No incidents found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Title</th>
                      <th className="px-3 py-2 font-medium">Severity</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidentPreview.map((i) => (
                      <tr
                        key={i.id}
                        className="border-t border-border/80 hover:bg-primary/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedIncident(i)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setSelectedIncident(i);
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        <td className="px-3 py-2 text-foreground">{i.title}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`inline-flex h-2.5 w-2.5 rounded-full ${incidentSeverityDot(i.severity)}`}
                            />
                            {i.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${incidentStatusPillClass(i.status)}`}
                          >
                            {i.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {i.timeLabel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Guest Pass"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Guest name
            </label>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Full name of your guest"
            />
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
                    guestType === t
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {passTypeLabel(t)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {guestType === "single" &&
                "✓ One-time entry, expires at midnight"}
              {guestType === "service" &&
                "✓ Restricted time window (e.g. 9AM – 5PM only)"}
              {guestType === "permanent" &&
                "✓ Unrestricted recurring access for family"}
            </p>
          </div>

          {guestType === "service" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Start time
                </label>
                <Input
                  type="time"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  End time
                </label>
                <Input
                  type="time"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Valid date
            </label>
            <Input
              type="date"
              value={validDate}
              onChange={(e) => setValidDate(e.target.value)}
            />
          </div>

          <Button
            className="w-full bg-gradient-gold shadow-gold hover:opacity-90"
            onClick={createPass}
          >
            <QrCode className="h-4 w-4 mr-2" /> Generate Guest Pass
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={createPaymentOpen}
        onClose={() => setCreatePaymentOpen(false)}
        title="Create payment request"
      >
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Resident
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {resident ? resident.name : "—"} ·{" "}
              {resident ? `Unit ${resident.unit}` : ""}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Payment type
            </label>
            <Input
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              placeholder="e.g. Service Charge, Maintenance, Security Levy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Amount
            </label>
            <Input
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="e.g. ₦250,000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Notes (optional)
            </label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Add a note for admin review..."
              className="w-full min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end pt-1">
            <Button
              variant="outline"
              onClick={() => setCreatePaymentOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-gold shadow-gold hover:opacity-90"
              type="button"
              disabled={
                !resident ||
                paymentAmount.trim().length === 0 ||
                paymentType.trim().length === 0
              }
              onClick={() => {
                if (!resident) return;
                if (paymentAmount.trim().length === 0) return;
                if (paymentType.trim().length === 0) return;

                if (isApiMode()) {
                  void (async () => {
                    try {
                      const nextPayment = await createPaymentRequestApi({
                        type: paymentType.trim(),
                        amount: paymentAmount.trim(),
                        notes: paymentNotes.trim() || undefined,
                      });
                      setPayments((prev) => [nextPayment, ...prev]);
                      const notifs = await fetchMyNotifications();
                      setNotifications(notifs);
                      setCreatePaymentOpen(false);
                      setPaymentAmount("");
                      setPaymentNotes("");
                    } catch {
                      /* ignore */
                    }
                  })();
                  return;
                }

                const nowTs = Date.now();
                const id = `pay_res_${nowTs}_${Math.random().toString(16).slice(2, 6)}`;
                const dateLabel = new Date().toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const reference = `REQ-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

                const nextPayment: PaymentRecord = {
                  id,
                  residentId: resident.id,
                  residentName: resident.name,
                  unit: resident.unit,
                  amount: paymentAmount.trim(),
                  type: paymentType.trim(),
                  status: paymentStatus,
                  dateLabel,
                  createdAt: nowTs,
                  reference,
                  notes: paymentNotes.trim() || undefined,
                };

                const next = [nextPayment, ...payments];
                savePayments(next);
                setPayments(next);
                setCreatePaymentOpen(false);

                const n = pushResidentNotification({
                  residentId: resident.id,
                  type: "payment",
                  message: `Payment request submitted: ${paymentType.trim()} (${paymentAmount.trim()})`,
                });
                setNotifications((prev) => [n, ...prev]);

                setPaymentAmount("");
                setPaymentNotes("");
              }}
            >
              Submit payment request
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title={selectedPayment?.type ?? "Payment"}
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={paymentBadgeVariant(selectedPayment.status) as any}
              >
                {selectedPayment.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Due:{" "}
                <span className="font-medium text-foreground">
                  {selectedPayment.dateLabel}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Resident
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {selectedPayment.residentName} · Unit {selectedPayment.unit}
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {selectedPayment.amount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Type:{" "}
                  <span className="font-medium text-foreground">
                    {selectedPayment.type}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reference
              </p>
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm font-mono text-foreground break-all">
                  {selectedPayment.reference ?? "—"}
                </div>
                {selectedPayment.reference ? (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          selectedPayment.reference ?? "",
                        );
                        setCopiedPaymentRef(true);
                        window.setTimeout(
                          () => setCopiedPaymentRef(false),
                          1500,
                        );
                      } catch {
                        // ignore clipboard failures in demo mode
                      }
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                    {copiedPaymentRef && (
                      <span className="ml-2 text-xs font-semibold text-primary">
                        Copied!
                      </span>
                    )}
                  </Button>
                ) : null}
              </div>
            </div>

            {selectedPayment.notes ? (
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Notes
                </p>
                <p className="mt-2 text-sm text-foreground leading-relaxed">
                  {selectedPayment.notes}
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Notes
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  No notes provided.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident?.title ?? "Incident"}
      >
        {selectedIncident && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex h-2.5 w-2.5 rounded-full ${incidentSeverityDot(selectedIncident.severity)}`}
              />
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${incidentStatusPillClass(selectedIncident.status)}`}
              >
                {selectedIncident.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedIncident.timeLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reporter
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {selectedIncident.reporter}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Severity:{" "}
                  <span className="font-medium text-foreground">
                    {selectedIncident.severity}
                  </span>
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Incident ID
                </p>
                <p className="mt-2 text-sm font-mono text-foreground">
                  {selectedIncident.id}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Description
              </p>
              <p className="mt-2 text-sm text-foreground leading-relaxed">
                {selectedIncident.description ?? "No description provided."}
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Updates
              </p>
              {selectedIncident.updates && selectedIncident.updates.length ? (
                <div className="mt-3 space-y-3">
                  {selectedIncident.updates.map((u) => (
                    <div
                      key={u.id}
                      className="rounded-xl border border-border bg-background p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground">
                          {u.by}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-foreground leading-relaxed">
                        {u.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No updates yet.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedPass}
        onClose={() => setSelectedPass(null)}
        title={selectedPass?.guestName ?? ""}
      >
        {selectedPass && (
          <div className="text-center space-y-4">
            <Badge
              variant={passStatusBadgeVariant(selectedPass.status) as any}
              className="mx-auto"
            >
              {passTypeLabel(selectedPass.passType)}
            </Badge>

            <div className="mx-auto">
              <QrCodeDisplay
                value={
                  origin
                    ? `${origin}/dashboard/security?code=${encodeURIComponent(selectedPass.code)}`
                    : ""
                }
                size={128}
                showDownload
                downloadFilename={`security-${selectedPass.code}.png`}
              />
            </div>

            <div className="text-xs font-mono text-muted-foreground break-all">
              Code: {selectedPass.code}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" /> {selectedPass.validUntilLabel}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" onClick={shareSelected}>
                Share (copy)
              </Button>
              <Button
                className="bg-destructive text-destructive-foreground"
                onClick={revokeSelected}
              >
                Revoke pass
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
