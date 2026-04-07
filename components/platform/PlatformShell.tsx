"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";

import { logoutRequest, meRequest } from "@/lib/estate-api";
import { clearSession, getStoredToken, isApiMode, setSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

const navItems: { href: string; label: string; exact?: boolean }[] = [
  { href: "/platform", label: "Overview", exact: true },
  { href: "/platform/pending", label: "Pending onboarding" },
  { href: "/platform/estates", label: "All estates" },
];

function navActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const verify = useCallback(async () => {
    setError(null);
    if (!isApiMode()) {
      setError("Set NEXT_PUBLIC_API_URL in .env.local to use platform administration.");
      setReady(true);
      return;
    }
    const token = getStoredToken();
    if (!token) {
      router.replace("/login?next=/platform");
      return;
    }
    try {
      const m = await meRequest();
      const u = m.user as { id: string; role: string; userId?: string; email?: string };
      if (u.role !== "platform_admin") {
        setError(
          `You are signed in as "${u.role}". Use the platform admin account (e.g. platform@estateos.local) or sign out.`,
        );
        setReady(true);
        return;
      }
      setSession({
        token,
        userId: u.userId ?? u.id,
        role: u.role,
      });
      setEmail(u.email ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Session check failed");
    } finally {
      setReady(true);
    }
  }, [router]);

  useEffect(() => {
    void verify();
  }, [verify]);

  const title = useMemo(() => {
    const hit = navItems.find((n) => navActive(pathname, n.href, n.exact));
    return hit?.label ?? "Platform";
  }, [pathname]);

  const signOut = async () => {
    try {
      await logoutRequest();
    } catch {
      /* ignore */
    }
    clearSession();
    document.cookie = "estateos_role=; path=/; max-age=0";
    window.location.href = "/login";
  };

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-background p-6 md:p-10">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 border border-border bg-background hover:bg-muted"
            >
              Home
            </Link>
            <Button onClick={() => void signOut()}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/platform" className="flex items-center gap-2">
            <Image src="/assets/logo.png" alt="EstateOS" width={28} height={28} />
            <span className="font-display text-lg font-semibold">
              Estate<span className="text-gradient-gold">OS</span>
            </span>
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform admin</p>
          {email && <p className="text-sm font-medium text-foreground truncate mt-1">{email}</p>}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = navActive(pathname, item.href, item.exact);
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
                <Image
                  src="/assets/logo.png"
                  alt=""
                  width={18}
                  height={18}
                  className={`shrink-0 rounded-sm object-contain ${
                    active ? "opacity-100 ring-1 ring-primary/25" : "opacity-75"
                  }`}
                  aria-hidden
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-md text-sm font-medium transition-colors h-10 px-4 w-full justify-start text-muted-foreground hover:bg-muted"
          >
            Marketing site
          </Link>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => void signOut()}>
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

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground truncate">{title}</h1>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
