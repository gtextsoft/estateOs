"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createResidentId,
  loadResidents,
  saveResidents,
  type ResidentRecord,
} from "@/components/dashboard/residentsStore";

function monthYearLabel(ts = Date.now()) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function NewResidentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [unit, setUnit] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    return name.trim().length >= 2 && email.trim().includes("@") && unit.trim().length >= 2;
  }, [name, email, unit]);

  const onSave = async () => {
    setError(null);
    if (!canSave) {
      setError("Please enter name, email, and unit.");
      return;
    }
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 650));
      const existing = loadResidents();
      const record: ResidentRecord = {
        id: createResidentId(name),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        unit: unit.trim().toUpperCase(),
        phone: phone.trim() || undefined,
        status: "Pending",
        since: monthYearLabel(),
      };
      saveResidents([record, ...existing]);
      router.push("/dashboard/residents");
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Add Resident</h1>
          <p className="text-sm text-muted-foreground">Create a resident profile.</p>
        </div>
        <Link href="/dashboard/residents" className="text-sm font-medium text-primary hover:underline">
          Back
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-soft p-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Full name
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chukwuemeka Eze" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Email
            </label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="e.g. emeka@mail.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Unit
            </label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. A-01" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Phone (optional)
            </label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +2348012345678" />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="cursor-pointer" onClick={() => router.push("/dashboard/residents")} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-gold shadow-gold hover:opacity-90 cursor-pointer"
            onClick={onSave}
            disabled={saving || !canSave}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
            {saving ? "Saving..." : "Create resident"}
          </Button>
        </div>
      </div>
    </div>
  );
}

