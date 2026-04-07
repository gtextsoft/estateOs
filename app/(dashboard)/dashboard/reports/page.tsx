"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  loadSecurityEvents,
  type SecurityEventRecord,
} from "@/components/dashboard/securityStore";
import { loadPasses } from "@/components/resident/store";
import type { GuestPass } from "@/components/resident/types";
import { loadPayments, type PaymentRecord } from "@/components/dashboard/paymentsStore";
import { loadIncidents, type IncidentRecord } from "@/components/dashboard/incidentsStore";
import { loadResidents, type ResidentRecord } from "@/components/dashboard/residentsStore";
import {
  fetchAdminGuestPassesAll,
  fetchAdminIncidents,
  fetchAdminPayments,
  fetchAdminResidents,
  fetchSecurityEvents,
} from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

const GOLD = "#C9A84C";
const EMERALD = "#2ECC71";
const AMBER = "#F39C12";
const RED = "#E74C3C";

function formatHour(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit" });
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatDay(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function parseMoney(amount: string) {
  // "₦250,000" -> 250000
  const digits = amount.replace(/[^\d]/g, "");
  const n = Number(digits || "0");
  return Number.isFinite(n) ? n : 0;
}

function formatRevenue(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  if (v === 0) return "₦0";
  if (v >= 1000000) return `₦${Math.round(v / 100000) / 10}M`;
  if (v >= 1000) return `₦${Math.round(v / 1000)}k`;
  return `₦${v}`;
}

function formatVisitors(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return `${v} visitors`;
}

function uniqSeriesByKey<T extends Record<string, unknown>>(arr: T[], key: keyof T) {
  const map = new Map<string, T>();
  for (const item of arr) {
    const k = String(item[key] ?? "");
    if (!k) continue;
    map.set(k, item);
  }
  return Array.from(map.values());
}

export default function ReportsPage() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEventRecord[]>([]);
  const [passes, setPasses] = useState<GuestPass[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);

  useEffect(() => {
    const refresh = () => {
      if (isApiMode()) {
        void (async () => {
          try {
            const [ev, gp, pay, inc, res] = await Promise.all([
              fetchSecurityEvents({ limit: 500 }),
              fetchAdminGuestPassesAll(),
              fetchAdminPayments(),
              fetchAdminIncidents(),
              fetchAdminResidents(),
            ]);
            setSecurityEvents(ev);
            setPasses(gp);
            setPayments(pay);
            setIncidents(inc);
            setResidents(res);
          } catch {
            setSecurityEvents([]);
            setPasses([]);
            setPayments([]);
            setIncidents([]);
            setResidents([]);
          }
        })();
        return;
      }
      setSecurityEvents(loadSecurityEvents());
      setPasses(loadPasses());
      setPayments(loadPayments());
      setIncidents(loadIncidents());
      setResidents(loadResidents());
    };

    refresh();

    const onStorage = (e: StorageEvent) => {
      if (isApiMode()) return;
      if (!e.key) return;
      if (
        e.key === "estateos_security_events_v1" ||
        e.key === "estateos_resident_passes_v1" ||
        e.key === "estateos_payments_v1" ||
        e.key === "estateos_incidents_v1" ||
        e.key === "estateos_residents_v1"
      ) {
        refresh();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const visitorTraffic = useMemo(() => {
    const now = Date.now();
    const hours = 12;
    const hMs = 60 * 60 * 1000;
    const start = now - (hours - 1) * hMs;

    const buckets = Array.from({ length: hours }).map((_, i) => {
      const ts = start + i * hMs;
      return { time: formatHour(ts), visitors: 0 };
    });

    const addToBuckets = (t: number, delta: number) => {
      const idx = Math.floor((t - start) / hMs);
      if (idx < 0 || idx >= buckets.length) return;
      buckets[idx].visitors += delta;
    };

    const entryEvents = securityEvents.filter((ev) => ev.subjectType === "guest_pass" && ev.type === "entry");
    if (entryEvents.length > 0) {
      for (const ev of entryEvents) addToBuckets(ev.time, 1);
      return buckets;
    }

    // Fallback: if no scans yet, use pass creation timestamps.
    for (const p of passes) addToBuckets(p.createdAt, 1);
    return buckets;
  }, [securityEvents, passes]);

  const paymentCollection = useMemo(() => {
    const now = Date.now();
    const days = 10;
    const dayMs = 24 * 60 * 60 * 1000;
    const start = startOfDay(now - (days - 1) * dayMs);

    const buckets = Array.from({ length: days }).map((_, i) => {
      const ts = start + i * dayMs;
      return { day: formatDay(ts), revenue: 0 };
    });

    const bucketIndex = (ts: number) => {
      const dayTs = startOfDay(ts);
      const idx = Math.floor((dayTs - start) / dayMs);
      if (idx < 0 || idx >= buckets.length) return -1;
      return idx;
    };

    for (const p of payments) {
      // Use only paid amounts for "Revenue"
      if (p.status !== "Paid") continue;
      const idx = bucketIndex(p.createdAt);
      if (idx === -1) continue;
      buckets[idx].revenue += parseMoney(p.amount);
    }

    return buckets;
  }, [payments]);

  const incidentTrends = useMemo(() => {
    const now = Date.now();
    const days = 10;
    const dayMs = 24 * 60 * 60 * 1000;
    const start = startOfDay(now - (days - 1) * dayMs);

    const buckets = Array.from({ length: days }).map((_, i) => {
      const ts = start + i * dayMs;
      return { day: formatDay(ts), low: 0, medium: 0, high: 0 };
    });

    const bucketIndex = (ts: number) => {
      const dayTs = startOfDay(ts);
      const idx = Math.floor((dayTs - start) / dayMs);
      if (idx < 0 || idx >= buckets.length) return -1;
      return idx;
    };

    for (const inc of incidents) {
      const idx = bucketIndex(inc.createdAt);
      if (idx === -1) continue;
      if (inc.severity === "Low") buckets[idx].low += 1;
      if (inc.severity === "Medium") buckets[idx].medium += 1;
      if (inc.severity === "High") buckets[idx].high += 1;
    }

    return buckets;
  }, [incidents]);

  const residentActivity = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of residents) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    }

    const pieData = [
      { name: "Active", value: counts["Active"] ?? 0, color: EMERALD },
      { name: "Pending", value: counts["Pending"] ?? 0, color: AMBER },
      { name: "Inactive", value: counts["Inactive"] ?? 0, color: RED },
    ];

    return uniqSeriesByKey(pieData, "name");
  }, [residents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">Real insights from your estate activity.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Visitor Traffic */}
        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-display text-base font-semibold text-foreground">Visitor Traffic</h3>
            <p className="text-xs text-muted-foreground mt-1">Last 12 hours guest pass entries</p>
          </div>

          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={visitorTraffic}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--slate-deep))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--secondary-foreground))" }}
                  itemStyle={{ color: GOLD }}
                  formatter={(value, name) => {
                    if (name === "visitors") return [formatVisitors(Number(value)), "Visitors"];
                    return [value, name];
                  }}
                />
                <Area type="monotone" dataKey="visitors" stroke={GOLD} strokeWidth={2} fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Collection */}
        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-display text-base font-semibold text-foreground">Payment Collection</h3>
            <p className="text-xs text-muted-foreground mt-1">Daily paid revenue (last 10 days)</p>
          </div>

          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paymentCollection}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatRevenue(Number(v))}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--slate-deep))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  itemStyle={{ color: GOLD }}
                  labelStyle={{ color: "hsl(var(--secondary-foreground))" }}
                  formatter={(value, name) => {
                    if (name === "revenue") return [formatRevenue(Number(value)), "Revenue"];
                    return [value, name];
                  }}
                />
                <Bar dataKey="revenue" fill={GOLD} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Trends */}
        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-display text-base font-semibold text-foreground">Incident Trends</h3>
            <p className="text-xs text-muted-foreground mt-1">Daily incidents by severity (last 10 days)</p>
          </div>

          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={incidentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--slate-deep))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--secondary-foreground))" }}
                  formatter={(value, name) => [`${value}`, name === "high" ? "High" : name === "medium" ? "Medium" : "Low"]}
                />
                <Bar dataKey="high" stackId="a" fill={RED} radius={[8, 8, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill={AMBER} radius={[8, 8, 0, 0]} />
                <Bar dataKey="low" stackId="a" fill={GOLD} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resident Activity */}
        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-display text-base font-semibold text-foreground">Resident Activity</h3>
            <p className="text-xs text-muted-foreground mt-1">Current resident status distribution</p>
          </div>

          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--slate-deep))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--secondary-foreground))" }}
                />
                <Pie
                  data={residentActivity}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {residentActivity.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {residentActivity.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
                  <span className="text-foreground font-medium">{entry.name}:</span> {entry.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

