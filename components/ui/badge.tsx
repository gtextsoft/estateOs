"use client";

import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "active" | "pending" | "used" | "revoked";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const styles: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-secondary text-secondary-foreground",
    active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    used: "bg-secondary text-muted-foreground",
    revoked: "bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}

