"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadNotifications, saveNotifications } from "@/components/resident/store";
import type { ResidentNotification } from "@/components/resident/types";

function notifTitle(n: ResidentNotification) {
  if (n.type === "arrival") return "Visitor arrived";
  if (n.type === "service") return "Guest verified";
  if (n.type === "payment") return "Payment update";
  return "Notice / Incident update";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ResidentNotification[]>([]);

  useEffect(() => {
    const load = () => setNotifications(loadNotifications());
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "estateos_resident_notifications_v1") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAllRead = () => {
    const next = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(next);
    setNotifications(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay updated on estate activity.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
          <Check className="h-4 w-4 mr-2" /> Mark All Read
        </Button>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-card rounded-xl border p-4 shadow-soft text-sm text-muted-foreground">
            No notifications found.
          </div>
        ) : (
          notifications.map((n) => (
          <div
            key={n.id}
            className={`bg-card rounded-xl border p-4 shadow-soft flex items-start gap-3 transition-colors ${
              n.read ? "border-border" : "border-primary/30 bg-primary/5"
            }`}
          >
            <div
              className={`mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                !n.read ? "bg-gradient-gold" : "bg-muted"
              }`}
            >
              <Bell className={`h-4 w-4 ${!n.read ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{notifTitle(n)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{n.timeLabel}</p>
            </div>
            {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
          </div>
          ))
        )}
      </div>
    </div>
  );
}

