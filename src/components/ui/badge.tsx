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
        cyan:
          "border-[color:var(--accent-cyan-border)] bg-[color:var(--accent-cyan-bg)] text-[color:var(--accent-cyan)]",
        fuchsia:
          "border-[color:var(--accent-fuchsia-border)] bg-[color:var(--accent-fuchsia-bg)] text-[color:var(--accent-fuchsia)]",
        amber:
          "border-[color:var(--accent-amber-border)] bg-[color:var(--accent-amber-bg)] text-[color:var(--accent-amber)]",
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

