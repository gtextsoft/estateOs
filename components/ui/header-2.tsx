"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";

export function Header() {
  const pathname = usePathname();
  const hashPrefix = pathname === "/" ? "" : "/";
  const links = [
    { label: "Features", href: `${hashPrefix}#features` },
    { label: "How it works", href: `${hashPrefix}#how-it-works` },
    { label: "Pricing", href: `${hashPrefix}#pricing` },
    { label: "Stories", href: "/testimonials" },
  ] as const;

  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-[100] mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out",
        {
          "border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/50 md:top-4 md:max-w-4xl md:shadow":
            scrolled && !open,
          "bg-background/90": open,
        },
      )}
    >
      <nav
        className={cn("flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out", {
          "md:px-2": scrolled,
        })}
      >
        <Link href="/" className="flex items-center gap-2 text-foreground" aria-label="EstateOS home">
          <Image src="/assets/logo.png" alt="EstateOS" width={32} height={32} className="h-8 w-auto" />
          <span className="font-display text-base font-semibold tracking-tight">EstateOS</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <a key={link.href} className={buttonVariants({ variant: "ghost" })} href={link.href}>
              {link.label}
            </a>
          ))}
          <Button variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      <div
        className={cn(
          "fixed top-14 right-0 bottom-0 left-0 z-[90] flex flex-col overflow-hidden border-y bg-background/90 md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "flex h-full w-full flex-col justify-between gap-y-2 p-4 transition duration-200 ease-out",
            open ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="grid gap-y-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={buttonVariants({
                  variant: "ghost",
                  className: "justify-start",
                })}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login" onClick={() => setOpen(false)}>
                Sign In
              </Link>
            </Button>
            <Button className="w-full" asChild>
              <Link href="/signup" onClick={() => setOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
