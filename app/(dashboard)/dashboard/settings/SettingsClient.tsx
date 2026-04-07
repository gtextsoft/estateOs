"use client";

import { Settings } from "lucide-react";
import { BlacklistPanel } from "@/components/dashboard/BlacklistPanel";

export function SettingsClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your estate configuration.</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Settings className="h-7 w-7 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Security and access policies for your pilot estate.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-8">
        <BlacklistPanel />
      </div>
    </div>
  );
}
