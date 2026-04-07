"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto flex items-center justify-between h-20 px-6">
        <Link href="/" className="flex items-center">
          <Image src="/assets/logo.png" alt="EstateOS" width={64} height={64} />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-gradient-gold shadow-gold hover:opacity-90 transition-opacity text-primary-foreground"
          >
            Get Started
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>
            How It Works
          </a>
          <a href="#pricing" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>
            Pricing
          </a>
          <div className="flex gap-2 pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-gradient-gold shadow-gold hover:opacity-90 transition-opacity text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

