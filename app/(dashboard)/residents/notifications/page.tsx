"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CURRENT_RESIDENT_ID, loadNotifications, saveNotifications } from "@/components/resident/store";
import type { ResidentNotification } from "@/components/resident/types";

export default function ResidentNotificationsPage() {
  const [notifications, setNotifications] = useState<ResidentNotification[]>([]);

  useEffect(() => {
    const sync = () => {
      setNotifications(loadNotifications().filter((n) => n.residentId === CURRENT_RESIDENT_ID));
    };
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "estateos_resident_notifications_v1") sync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAllRead = () => {
    const all = loadNotifications();
    const nextAll = all.map((n) =>
      n.residentId === CURRENT_RESIDENT_ID ? { ...n, read: true } : n,
    );
    saveNotifications(nextAll);
    setNotifications(nextAll.filter((n) => n.residentId === CURRENT_RESIDENT_ID));
  };

  return (
    <div className="max-w-6xl mx-auto bg-card rounded-xl border border-border shadow-soft">
      <div className="p-5 border-b border-border flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {notifications.length} total · {unreadCount} unread
          </p>
        </div>
        <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
          Mark all as read
        </Button>
      </div>

      <div className="p-5 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-sm text-muted-foreground">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`rounded-xl border border-border p-4 ${n.read ? "opacity-70" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${n.read ? "bg-muted-foreground" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.timeLabel}</p>
                </div>
                <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
