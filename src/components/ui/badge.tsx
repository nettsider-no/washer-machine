"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-xs font-semibold text-zinc-200",
  {
    variants: {
      variant: {
        default: "",
        cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
        fuchsia: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200",
        amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
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

