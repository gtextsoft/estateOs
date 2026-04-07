"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerEstateRequest } from "@/lib/estate-api";
import { isApiMode, setSession } from "@/lib/session";

export default function RegisterEstatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [managerName, setManagerName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isApiMode()) {
        setError("NEXT_PUBLIC_API_URL is not set");
        return;
      }
      const res = await registerEstateRequest({
        name: name.trim(),
        slug: slug.trim(),
        email: email.trim(),
        password,
        managerName: managerName.trim() || undefined,
      });
      setSession({ token: res.token, userId: res.userId, role: res.role });
      document.cookie = `estateos_role=${res.role}; path=/; max-age=${60 * 60 * 24 * 30}`;
      router.push("/pending-estate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
      <div className="w-full lg:w-[520px] bg-card border-l border-border px-6 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Estate manager</p>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Register your estate</h1>
          <p className="text-sm text-muted-foreground mb-6">
            A platform admin must approve your estate before it goes live.{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Estate / community name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="URL slug (e.g. sunset-hills)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Work email"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Password"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
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
              {loading ? "Submitting…" : "Submit for review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
