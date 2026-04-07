import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, AlertTriangle, CreditCard, QrCode, Users } from "lucide-react";

const stats = [
  { label: "Total Residents", value: "248", change: "+12", up: true, icon: Users, href: "/dashboard/residents" },
  { label: "Visitors Today", value: "34", change: "+8", up: true, icon: QrCode, href: "/dashboard/visitors" },
  { label: "Open Incidents", value: "3", change: "-2", up: false, icon: AlertTriangle, href: "/dashboard/incidents" },
  { label: "Pending Payments", value: "₦1.2M", change: "+15%", up: true, icon: CreditCard, href: "/dashboard/payments" },
] as const;

const recentVisitors = [
  { id: "GPA-001", name: "Kelechi Nwosu", host: "Unit A-01 - Adaeze Okafor", time: "2 min ago", status: "Entered" },
  { id: "GPA-002", name: "MainFix Plumber", host: "Unit A-01 - Adaeze Okafor", time: "15 min ago", status: "Entered" },
  { id: "GPA-003", name: "Tunde (Family)", host: "Unit A-01 - Adaeze Okafor", time: "32 min ago", status: "Exited" },
  { id: "GPA-004", name: "Delivery - DHL", host: "Unit A-01 - Adaeze Okafor", time: "1 hr ago", status: "Exited" },
] as const;

const recentIncidents = [
  { id: "inc_unauth_parking", title: "Unauthorized parking", location: "Block B Lot", severity: "Low", time: "1 hr ago" },
  { id: "inc_noise_9d", title: "Noise complaint", location: "Unit 9D", severity: "Medium", time: "3 hrs ago" },
  { id: "inc_gate_malfunction", title: "Gate malfunction", location: "North Gate", severity: "High", time: "5 hrs ago" },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Good morning, James</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening at Prestige Palms today.</p>
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
            {recentVisitors.map((v, i) => (
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
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      v.status === "Entered" ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"
                    }`}
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
            {recentIncidents.map((inc, i) => (
              <Link
                key={inc.id}
                href={`/dashboard/incidents/${inc.id}`}
                className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{inc.title}</p>
                  <p className="text-xs text-muted-foreground">{inc.location}</p>
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
                  <p className="text-xs text-muted-foreground mt-1">{inc.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

