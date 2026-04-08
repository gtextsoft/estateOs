"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";

export function PublicChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="relative z-10 px-4 pt-2 md:px-6 md:pt-4">
        <Navbar />
      </div>
      <main className="relative z-10 min-h-[70vh]">{children}</main>
    </>
  );
}
