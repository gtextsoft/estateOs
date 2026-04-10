"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";

export function PublicChrome({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Reserve space for fixed navbar (pt + nav height matches header-2) */}
      <div className="h-18 shrink-0 md:h-20" aria-hidden />
      <Navbar />
      <main className="relative z-10 min-h-[70vh] min-w-0">{children}</main>
    </>
  );
}
