"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  QrCode,
  Siren,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadNotifications, saveNotifications } from "@/components/resident/store";
import type { ResidentNotification } from "@/components/resident/types";
import { loadResidents, type ResidentRecord } from "@/components/dashboard/residentsStore";
import { fetchMyNotifications, fetchMyProfile, logoutRequest } from "@/lib/estate-api";
import { clearSession, getCurrentResidentId, isApiMode } from "@/lib/session";

type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  hash?: string;
};

const residentNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Home", href: "/residents" },
  { icon: QrCode, label: "Guest passes", href: "/residents/guest-passes" },
  { icon: CreditCard, label: "Payments", href: "/residents/payments" },
  { icon: AlertTriangle, label: "Incidents", href: "/residents/incidents" },
  { icon: Bell, label: "Notifications", href: "/residents/notifications" },
  { icon: Siren, label: "Emergency", href: "/residents/emergency" },
  { icon: LifeBuoy, label: "Support", href: "/support" },
];

function navHref(item: NavItem) {
  return item.hash ? `${item.href}#${item.hash}` : item.href;
}

export function ResidentShell({
  children,
  roleLabel,
}: {
  children: React.ReactNode;
  roleLabel: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [hash, setHash] = useState("");
  const pathname = usePathname();
  const notifRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);
  const [resident, setResident] = useState<ResidentRecord | null>(null);
  const [notifications, setNotifications] = useState<ResidentNotification[]>([]);

  useEffect(() => {
    const readHash = () => setHash(typeof window !== "undefined" ? window.location.hash.slice(1) : "");
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (isApiMode()) {
        try {
          const [prof, notifs] = await Promise.all([fetchMyProfile(), fetchMyNotifications()]);
          setResident(prof);
          setNotifications(notifs);
        } catch {
          setResident(null);
          setNotifications([]);
        }
        return;
      }
      const all = loadResidents();
      setResident(all.find((r) => r.id === getCurrentResidentId()) ?? null);
      setNotifications(loadNotifications().filter((n) => n.residentId === getCurrentResidentId()));
    };
    void load();
    const onStorage = (e: StorageEvent) => {
      if (
        !isApiMode() &&
        (e.key === "estateos_residents_v1" || e.key === "estateos_resident_notifications_v1")
      ) {
        void load();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const title = useMemo(() => {
    if (pathname === "/residents/guest-passes") return "Guest passes";
    if (pathname === "/residents/payments") return "Payments";
    if (pathname === "/residents/incidents") return "Incidents";
    if (pathname === "/residents/notifications") return "Notifications";
    if (pathname === "/residents/emergency") return "Emergency";
    if (pathname !== "/residents") return "Resident";
    const map: Record<string, string> = {
      "guest-passes": "Guest passes",
      payments: "Payments",
      incidents: "Incidents",
      notifications: "Notifications",
      emergency: "Emergency",
    };
    return map[hash] ?? "Resident Portal (Home)";
  }, [pathname, hash]);

  const user = useMemo(() => {
    const name = resident?.name ?? "Resident";
    const parts = name.trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase() || "R";
    return { name, initials, unit: resident?.unit ?? "—" };
  }, [resident]);

  const notifTitle = (n: ResidentNotification) => {
    if (n.type === "arrival") return "Visitor arrived";
    if (n.type === "service") return "Guest verified";
    if (n.type === "payment") return "Payment update";
    if (n.type === "emergency") return "Emergency";
    return "Notice";
  };

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

  const isActive = (item: NavItem) => {
    if (item.href === "/support") return pathname === "/support";
    if (item.href === "/residents/guest-passes") return pathname === "/residents/guest-passes";
    if (item.href === "/residents/payments") return pathname === "/residents/payments";
    if (item.href === "/residents/incidents") return pathname === "/residents/incidents";
    if (item.href === "/residents/notifications") return pathname === "/residents/notifications";
    if (item.href === "/residents/emergency") return pathname === "/residents/emergency";
    if (pathname !== "/residents") return false;
    if (!item.hash) return !hash;
    return hash === item.hash;
  };

  return (
    <div className="min-h-dvh bg-background flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-0 lg:h-dvh flex flex-col overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/logo.png" alt="EstateOS" width={28} height={28} />
            <span className="font-display text-lg font-semibold">
              Estate<span className="text-gradient-gold">OS</span>
            </span>
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-muted text-sm font-medium text-foreground">
            <span>Resident Portal</span>
            {/* <ChevronDown className="h-4 w-4 text-muted-foreground" /> */}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
          {residentNav.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={`${item.href}-${item.hash ?? "root"}`}
                href={navHref(item)}
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

        <div className="p-4 border-t border-border shrink-0">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => {
              void (async () => {
                document.cookie = "estateos_role=; path=/; max-age=0";
                if (isApiMode()) {
                  try {
                    await logoutRequest();
                  } catch {
                    /* ignore */
                  }
                  clearSession();
                }
                window.location.href = "/login";
              })();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <main className="flex-1 min-w-0 flex flex-col min-h-dvh">
        <header className="h-16 border-b border-border flex items-center justify-between gap-3 px-4 sm:px-6 shrink-0">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button type="button" className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-display truncate text-base font-semibold text-foreground sm:text-lg">{title}</h2>
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
                <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] sm:w-80 bg-card border border-border rounded-xl shadow-card overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="font-display text-sm font-semibold text-foreground">Notifications</p>
                    <Link
                      href="/residents/notifications"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => {
                        if (isApiMode()) {
                          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                          setNotifOpen(false);
                          return;
                        }
                        const rid = getCurrentResidentId();
                        const current = loadNotifications();
                        const next = current.map((n) =>
                          n.residentId === rid ? { ...n, read: true } : n,
                        );
                        saveNotifications(next);
                        setNotifications(next.filter((n) => n.residentId === rid));
                        setNotifOpen(false);
                      }}
                    >
                      Mark read & view
                    </Link>
                  </div>
                  <div className="divide-y divide-border max-h-80 overflow-y-auto">
                    {notifications.slice(0, 10).map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                              !n.read ? "bg-primary" : "bg-muted-foreground"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{notifTitle(n)}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{n.timeLabel}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userRef}>
              <button
                type="button"
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
                <div className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] sm:w-72 bg-card border border-border rounded-xl shadow-card overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">Unit {user.unit}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/support"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => setUserOpen(false)}
                    >
                      <LifeBuoy className="h-4 w-4" />
                      Support
                    </Link>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => {
                        void (async () => {
                          document.cookie = "estateos_role=; path=/; max-age=0";
                          if (isApiMode()) {
                            try {
                              await logoutRequest();
                            } catch {
                              /* ignore */
                            }
                            clearSession();
                          }
                          window.location.href = "/login";
                        })();
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
        <div className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
