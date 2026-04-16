"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-[var(--border)] bg-[color:var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]",
  {
    variants: {
      variant: {
        default: "",
        accent:
          "border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] text-[color:var(--accent-ink)]",
        warning:
          "border-[color:var(--warning-border)] bg-[color:var(--warning-bg)] text-[color:var(--warning)]",
        danger:
          "border-[color:var(--danger-border)] bg-[color:var(--danger-bg)] text-[color:var(--danger)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

