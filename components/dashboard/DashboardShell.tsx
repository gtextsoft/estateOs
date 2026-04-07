"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Settings,
  Shield,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { loadNotifications, saveNotifications } from "@/components/resident/store";
import type { ResidentNotification } from "@/components/resident/types";
import {
  acknowledgeEmergencyAlert,
  getLatestActiveEmergencyAlert,
  type EmergencyAlert,
} from "@/components/dashboard/emergencyStore";

type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
};

const adminNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Users, label: "Residents", href: "/dashboard/residents" },
  { icon: UserCheck, label: "KYC queue", href: "/dashboard/kyc" },
  { icon: QrCode, label: "Visitor Access", href: "/dashboard/visitors" },
  { icon: Shield, label: "Security", href: "/dashboard/security" },
  { icon: AlertTriangle, label: "Incidents", href: "/dashboard/incidents" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function DashboardShell({
  children,
  roleLabel,
}: {
  children: React.ReactNode;
  roleLabel: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname();
  const notifRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(() => {
    const hit = adminNav.find((n) => pathname === n.href);
    return hit?.label ?? "Dashboard";
  }, [pathname]);

  const user = useMemo(() => {
    if (roleLabel === "Security Guard") return { name: "Jordan Davis", initials: "JD" };
    if (roleLabel === "Resident") return { name: "Sarah Chen", initials: "SC" };
    return { name: "James Doe", initials: "JD" };
  }, [roleLabel]);

  const [adminNotifications, setAdminNotifications] = useState<ResidentNotification[]>([]);
  const [priorityEmergency, setPriorityEmergency] = useState<EmergencyAlert | null>(null);

  useEffect(() => {
    const load = () => setAdminNotifications(loadNotifications());
    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "estateos_resident_notifications_v1") load();
      if (e.key === "estateos_emergency_alerts_v1") {
        setPriorityEmergency(getLatestActiveEmergencyAlert());
      }
    };
    setPriorityEmergency(getLatestActiveEmergencyAlert());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const unreadCount = useMemo(() => adminNotifications.filter((n) => !n.read).length, [adminNotifications]);

  const adminNotifTitle = (n: ResidentNotification) => {
    if (n.type === "arrival") return "Visitor arrived";
    if (n.type === "service") return "Guest verified";
    if (n.type === "payment") return "Payment update";
    if (n.type === "emergency") return "Emergency alert";
    return "Notice / Incident update";
  };

  const allowedNav = useMemo(() => {
    if (roleLabel === "Security Guard") {
      return adminNav.filter((n) => ["Overview", "Security", "Incidents", "Notifications"].includes(n.label));
    }
    if (roleLabel === "Resident") {
      return adminNav.filter((n) => ["Overview"].includes(n.label));
    }
    return adminNav;
  }, [roleLabel]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/logo.png" alt="EstateOS" width={28} height={28} />
            <span className="font-display text-lg font-semibold">
              Estate<span className="text-gradient-gold">OS</span>
            </span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-border">
          <button className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-muted text-sm font-medium text-foreground">
            <span>{roleLabel}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowedNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => {
              document.cookie = "estateos_role=; path=/; max-age=0";
              window.location.href = "/";
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block">
            <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative cursor-pointer"
                aria-label="Notifications"
                aria-expanded={notifOpen}
                onClick={() => {
                  setUserOpen(false);
                  setNotifOpen((v) => !v);
                }}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-card overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="font-display text-sm font-semibold text-foreground">Notifications</p>
                    <Link
                      href="/dashboard/notifications"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => {
                        // Mark notifications as read when the admin opens the full notifications page.
                        const current = loadNotifications();
                        const next = current.map((n) => ({ ...n, read: true }));
                        saveNotifications(next);
                        setAdminNotifications(next);
                      }}
                    >
                      View all
                    </Link>
                  </div>
                  <div className="divide-y divide-border">
                    {adminNotifications.slice(0, 10).map((n, idx) => (
                      <div key={idx} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                              !n.read ? "bg-primary" : "bg-muted-foreground"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{adminNotifTitle(n)}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{n.timeLabel}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userRef}>
              <button
                className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-bold text-primary-foreground"
                aria-label="User menu"
                aria-expanded={userOpen}
                onClick={() => {
                  setNotifOpen(false);
                  setUserOpen((v) => !v);
                }}
              >
                {user.initials}
              </button>

              {userOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-card overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => setUserOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => {
                        document.cookie = "estateos_role=; path=/; max-age=0";
                        window.location.href = "/";
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
      <Modal
        isOpen={!!priorityEmergency}
        onClose={() => {
          if (!priorityEmergency) return;
          acknowledgeEmergencyAlert(priorityEmergency.id);
          setPriorityEmergency(null);
        }}
        title="Priority emergency alert"
      >
        {priorityEmergency && (
          <div className="space-y-4">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                Immediate attention required
              </p>
              <p className="mt-2 text-sm text-foreground">
                Resident <span className="font-semibold">{priorityEmergency.residentName}</span>{" "}
                (Unit {priorityEmergency.unit}) triggered an emergency alert.
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resident note</p>
              <p className="mt-2 text-sm text-foreground leading-relaxed">
                {priorityEmergency.message || "No extra message provided."}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(priorityEmergency.createdAt).toLocaleString()}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  acknowledgeEmergencyAlert(priorityEmergency.id);
                  setPriorityEmergency(null);
                }}
              >
                Mark acknowledged
              </Button>
              <Button
                className="bg-gradient-gold shadow-gold hover:opacity-90"
                onClick={() => {
                  acknowledgeEmergencyAlert(priorityEmergency.id);
                  setPriorityEmergency(null);
                  window.location.href = "/dashboard/security";
                }}
              >
                Open Security Dashboard
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

