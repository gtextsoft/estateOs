import type { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[hsla(var(--background)/1)]">
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}

