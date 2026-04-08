"use client";

import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

/** z-0 (not negative): -z-10 sits *under* the parent’s bg-* and becomes invisible. */
const gridBase =
  "pointer-events-none absolute inset-0 z-0 h-full min-h-full w-full bg-background bg-[linear-gradient(to_right,#e8e4dc_1px,transparent_1px),linear-gradient(to_bottom,#e8e4dc_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,rgb(255_255_255/0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.08)_1px,transparent_1px)]";

type DivProps = HTMLAttributes<HTMLDivElement>;

/** Grid mesh with a soft violet radial accent (top-right). */
export function PlatformLandingBackground({ className, ...props }: DivProps) {
  return (
    <div className={cx(gridBase, className)} aria-hidden {...props}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)] dark:bg-[radial-gradient(circle_800px_at_100%_200px,rgb(168_85_247/0.35),transparent)]" />
    </div>
  );
}

/** Grid mesh with a soft sky radial accent (center-top). */
export function PlatformLandingBackgroundSky({ className, ...props }: DivProps) {
  return (
    <div className={cx(gridBase, className)} aria-hidden {...props}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,rgb(56_189_248/0.25),transparent)]" />
    </div>
  );
}
