import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative w-full max-w-xs rounded-xl bg-card p-1.5 shadow-xl backdrop-blur-xl dark:bg-transparent",
        "border dark:border-border/80",
        className,
      )}
      {...props}
    />
  );
}

function Header({
  className,
  children,
  glassEffect = true,
  ...props
}: React.ComponentProps<"div"> & {
  glassEffect?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative mb-4 rounded-xl border bg-muted/80 p-4 dark:bg-muted/50",
        className,
      )}
      {...props}
    >
      {glassEffect ? (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)",
          }}
        />
      ) : null}
      {children}
    </div>
  );
}

function Plan({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mb-8 flex items-center justify-between", className)} {...props} />
  );
}

function Description({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

function PlanName({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "rounded-full border border-foreground/20 px-2 py-0.5 text-xs text-foreground/80",
        className,
      )}
      {...props}
    />
  );
}

function Price({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-3 flex items-end gap-1", className)} {...props} />;
}

function MainPrice({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span className={cn("text-3xl font-extrabold tracking-tight", className)} {...props} />
  );
}

function Period({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("pb-1 text-sm text-foreground/80", className)} {...props} />;
}

function OriginalPrice({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("ml-auto mr-1 text-lg text-muted-foreground line-through", className)}
      {...props}
    />
  );
}

function Body({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-6 p-3", className)} {...props} />;
}

function List({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("space-y-3", className)} {...props} />;
}

function ListItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("flex items-start gap-3 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function Separator({
  children = "Upgrade to access",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)} {...props}>
      <span className="h-px flex-1 bg-muted-foreground/40" />
      <span className="shrink-0 text-muted-foreground">{children}</span>
      <span className="h-px flex-1 bg-muted-foreground/40" />
    </div>
  );
}

export {
  Card,
  Header,
  Description,
  Plan,
  PlanName,
  Badge,
  Price,
  MainPrice,
  Period,
  OriginalPrice,
  Body,
  List,
  ListItem,
  Separator,
};
