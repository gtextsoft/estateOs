"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { resolveEstateSlug, signupRequest } from "@/lib/estate-api";
import { isApiMode, setSession } from "@/lib/session";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"resident" | "guard">("resident");
  const [estateSlug, setEstateSlug] = useState("demo-estate");
  const [estateName, setEstateName] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [building, setBuilding] = useState("");
  const [block, setBlock] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSlug = async () => {
    setError(null);
    try {
      const r = await resolveEstateSlug(estateSlug.trim());
      setEstateName(r.estate.name);
    } catch {
      setEstateName(null);
      setError("Estate not found or not active. Check the slug with your manager.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isApiMode()) {
        setError("NEXT_PUBLIC_API_URL is not set");
        return;
      }
      const res = await signupRequest({
        role,
        estateSlug: estateSlug.trim(),
        email: email.trim(),
        password,
        name: fullName.trim(),
        unit: unit.trim(),
        building: building.trim() || undefined,
        block: block.trim() || undefined,
        phone: phone.trim() || undefined,
        kyc: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          notes: notes.trim() || undefined,
        },
      });
      setSession({
        token: res.token,
        userId: res.userId,
        role: res.role,
        residentId: res.residentId,
      });
      document.cookie = `estateos_role=${res.role}; path=/; max-age=${60 * 60 * 24 * 30}`;
      router.push("/pending-kyc");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex overflow-hidden">
      <div className="hidden lg:flex flex-1 relative">
        <Image src="/assets/hero-estate.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-foreground/50" />
      </div>
      <div className="w-full lg:w-[520px] bg-card border-l border-border px-6 py-12 sm:px-10 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Join an estate</p>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("resident")}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                  role === "resident" ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                Resident
              </button>
              <button
                type="button"
                onClick={() => setRole("guard")}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                  role === "guard" ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                Security
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Estate slug
              </label>
              <div className="flex gap-2">
                <input
                  value={estateSlug}
                  onChange={(e) => {
                    setEstateSlug(e.target.value);
                    setEstateName(null);
                  }}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. demo-estate"
                  required
                />
                <button
                  type="button"
                  onClick={() => void checkSlug()}
                  className="rounded-md border border-border px-3 text-xs font-medium whitespace-nowrap"
                >
                  Verify
                </button>
              </div>
              {estateName && <p className="text-xs text-emerald-600 mt-1">Found: {estateName}</p>}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="Email"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="Password"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Full legal name"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {role === "resident" && (
                <>
                  <input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    placeholder="Unit (e.g. A-01)"
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <input
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder="Building (optional)"
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <input
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="Block (optional)"
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </>
              )}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes for estate manager (optional)"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
