import type { ReactNode } from "react";
import { PublicChrome } from "@/components/site/PublicChrome";
import { CinematicFooter } from "@/components/ui/motion-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-[hsla(var(--background)/1)]">
      <div className="site-page-grid" aria-hidden />
      <div className="relative z-10">
        <PublicChrome>{children}</PublicChrome>
        <CinematicFooter />
      </div>
    </div>
  );
}

