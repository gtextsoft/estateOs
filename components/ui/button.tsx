"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "default" | "outline" | "ghost";
type Size = "default" | "sm" | "icon";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground hover:opacity-90",
    outline: "border border-border bg-background hover:bg-muted",
    ghost: "hover:bg-muted",
  };

  const sizes: Record<Size, string> = {
    default: "h-10 px-4",
    sm: "h-9 px-3",
    icon: "h-10 w-10",
  };

  return (
    <button
      type={type}
      className={cx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

