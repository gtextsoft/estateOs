"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { meRequest } from "@/lib/estate-api";
import { isApiMode } from "@/lib/session";

export default function PendingKycPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isApiMode()) return;
    void (async () => {
      try {
        const m = await meRequest();
        if (m.user.kycStatus === "approved") {
          if (m.user.role === "resident") router.replace("/residents");
          else if (m.user.role === "guard") router.replace("/security");
        }
        if (m.user.kycStatus === "rejected") {
          router.replace("/login");
        }
      } catch {
        /* stay */
      }
    })();
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-foreground">KYC under review</h1>
        <p className="text-muted-foreground text-sm">
          Your estate manager will review your application. You can sign out and check back later.
        </p>
        <Link href="/login" className="inline-block text-primary text-sm font-medium hover:underline">
          Sign in again
        </Link>
      </div>
    </div>
  );
}
