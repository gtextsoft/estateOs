import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-[hsla(var(--border)/1)] py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/assets/logo.png" alt="EstateOS" width={24} height={24} />
            <span className="font-display text-lg font-semibold">
              Estate<span className="text-gradient-gold">OS</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/support" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 EstateOS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

