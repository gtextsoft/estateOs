"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, LogOut, Menu, QrCode, Shield, Siren, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Overview", href: "/security", icon: Home },
  { label: "Scanner", href: "/security/scanner", icon: QrCode },
  { label: "Emergencies", href: "/security/emergencies", icon: Siren },
  { label: "Events", href: "/security/events", icon: List },
];

export function SecurityShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = navItems.find((n) => n.href === pathname)?.label ?? "Security";

  return (
    <div className="min-h-dvh bg-background flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-0 lg:h-dvh flex flex-col overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="font-display text-base font-semibold text-foreground">Security</p>
              <p className="text-[11px] text-muted-foreground">Guard workspace</p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden h-8 w-8 rounded-md hover:bg-muted inline-flex items-center justify-center"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              document.cookie = "estateos_role=; path=/; max-age=0";
              window.location.href = "/login";
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

      <main className="flex-1 min-w-0">
        <header className="h-16 border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden h-9 w-9 rounded-md hover:bg-muted inline-flex items-center justify-center"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">Independent guard dashboard</p>
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
