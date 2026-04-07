"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { meRequest } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

export default function PendingEstatePage() {
  const router = useRouter();
  const [estate, setEstate] = useState<{ name?: string; slug?: string; status?: string } | null>(null);

  useEffect(() => {
    if (!isApiMode()) return;
    void (async () => {
      try {
        const m = await meRequest();
        const st = m.user.estate?.status;
        if (st === "active") {
          router.replace("/dashboard");
          return;
        }
        setEstate(m.user.estate ?? {});
      } catch {
        setEstate(null);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Estate pending approval</h1>
        <p className="text-muted-foreground text-sm">
          {estate?.name ?? "Your estate"} ({estate?.slug}) is waiting for platform verification. You will receive
          full manager access once approved.
        </p>
        <Link href="/login" className="inline-block text-primary text-sm font-medium hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
