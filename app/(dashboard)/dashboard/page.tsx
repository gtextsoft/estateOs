"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, AlertTriangle, CreditCard, QrCode, Users } from "lucide-react";
import { loadPasses } from "@/components/resident/store";
import { loadIncidents, type IncidentRecord } from "@/components/dashboard/incidentsStore";
import { loadPayments } from "@/components/dashboard/paymentsStore";
import { loadResidents } from "@/components/dashboard/residentsStore";
import {
  fetchAdminIncidents,
  fetchAdminPayments,
  fetchAdminResidents,
  fetchExpectedGuestPasses,
  isApiMode,
  meRequest,
} from "@/lib/estate-api";

type VisitorRow = { id: string; name: string; host: string; time: string; status: string };

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const numberFmt = new Intl.NumberFormat();

function initialsName(full?: string, email?: string) {
  if (full?.trim()) return full.trim();
  if (!email) return "Manager";
  const local = email.split("@")[0] ?? "";
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ") || "Manager"
  );
}

function relativeTime(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function parseAmount(v: string) {
  const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function DashboardPage() {
  const [managerName, setManagerName] = useState("Manager");
  const [estateName, setEstateName] = useState("your estate");
  const [residentsCount, setResidentsCount] = useState(0);
  const [visitorsCount, setVisitorsCount] = useState(0);
  const [openIncidentsCount, setOpenIncidentsCount] = useState(0);
  const [pendingPaymentsTotal, setPendingPaymentsTotal] = useState(0);
  const [recentVisitors, setRecentVisitors] = useState<VisitorRow[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<IncidentRecord[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        if (isApiMode()) {
          const today = new Date().toISOString().slice(0, 10);
          const [me, residents, visitors, incidents, payments] = await Promise.all([
            meRequest(),
            fetchAdminResidents(),
            fetchExpectedGuestPasses(today),
            fetchAdminIncidents(),
            fetchAdminPayments(),
          ]);
          setManagerName(initialsName((me.user as { name?: string }).name, me.user.email));
          setEstateName(me.user.estate?.name || "your estate");
          setResidentsCount(residents.length);
          setVisitorsCount(visitors.length);
          setOpenIncidentsCount(incidents.filter((i) => i.status !== "Resolved").length);
          setPendingPaymentsTotal(
            payments.filter((p) => p.status !== "Paid").reduce((sum, p) => sum + parseAmount(p.amount), 0),
          );
          setRecentVisitors(
            visitors.slice(0, 4).map((v) => ({
              id: v.id,
              name: v.guestName,
              host: `${v.residentUnit ? `Unit ${v.residentUnit} - ` : ""}${v.residentName ?? "Resident"}`,
              time: relativeTime(v.createdAt),
              status: v.status[0].toUpperCase() + v.status.slice(1),
            })),
          );
          setRecentIncidents(
            incidents
              .filter((i) => i.status !== "Resolved")
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 3),
          );
          return;
        }

        const residents = loadResidents();
        const visitors = loadPasses();
        const incidents = loadIncidents();
        const payments = loadPayments();
        setResidentsCount(residents.length);
        setVisitorsCount(
          visitors.filter((v) => (v.date ? v.date === new Date().toISOString().slice(0, 10) : true)).length,
        );
        setOpenIncidentsCount(incidents.filter((i) => i.status !== "Resolved").length);
        setPendingPaymentsTotal(
          payments.filter((p) => p.status !== "Paid").reduce((sum, p) => sum + parseAmount(p.amount), 0),
        );
        const residentById = new Map(residents.map((r) => [r.id, r]));
        setRecentVisitors(
          visitors
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 4)
            .map((v) => {
              const host = residentById.get(v.residentId);
              return {
                id: v.id,
                name: v.guestName,
                host: host ? `Unit ${host.unit} - ${host.name}` : "Resident",
                time: relativeTime(v.createdAt),
                status: v.status[0].toUpperCase() + v.status.slice(1),
              };
            }),
        );
        setRecentIncidents(
          incidents
            .filter((i) => i.status !== "Resolved")
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 3),
        );
      } catch {
        // Keep defaults if fetch fails.
      }
    })();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Total Residents",
        value: numberFmt.format(residentsCount),
        change: residentsCount > 0 ? "Live" : "0",
        up: residentsCount > 0,
        icon: Users,
        href: "/dashboard/residents",
      },
      {
        label: "Visitors Today",
        value: numberFmt.format(visitorsCount),
        change: visitorsCount > 0 ? "Live" : "0",
        up: visitorsCount > 0,
        icon: QrCode,
        href: "/dashboard/visitors",
      },
      {
        label: "Open Incidents",
        value: numberFmt.format(openIncidentsCount),
        change: openIncidentsCount > 0 ? "Attention" : "Clear",
        up: openIncidentsCount === 0,
        icon: AlertTriangle,
        href: "/dashboard/incidents",
      },
      {
        label: "Pending Payments",
        value: money.format(pendingPaymentsTotal || 0),
        change: pendingPaymentsTotal > 0 ? "Outstanding" : "Clear",
        up: pendingPaymentsTotal === 0,
        icon: CreditCard,
        href: "/dashboard/payments",
      },
    ],
    [openIncidentsCount, pendingPaymentsTotal, residentsCount, visitorsCount],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Good morning, {managerName}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening at {estateName} today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="block bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-card transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-semibold ${
                  s.up ? "text-emerald-600" : "text-destructive"
                }`}
              >
                {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border shadow-soft">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-display text-lg font-semibold text-foreground">Recent Visitors</h3>
            <Link href="/dashboard/visitors" className="text-xs font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentVisitors.map((v) => (
              <Link
                key={v.id}
                href={`/dashboard/visitors/${v.id}`}
                className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.host}</p>
                </div>
                <div className="text-right">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                  >
                    {v.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{v.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-soft">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-display text-lg font-semibold text-foreground">Open Incidents</h3>
            <Link href="/dashboard/incidents" className="text-xs font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentIncidents.map((inc) => (
              <Link
                key={inc.id}
                href={`/dashboard/incidents/${inc.id}`}
                className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{inc.title}</p>
                  <p className="text-xs text-muted-foreground">{inc.reporter}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      inc.severity === "High"
                        ? "bg-destructive/10 text-destructive"
                        : inc.severity === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {inc.severity}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{relativeTime(inc.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

