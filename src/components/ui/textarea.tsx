"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[96px] w-full resize-y rounded-lg border border-[var(--border)] bg-[color:var(--field)] px-3 py-2.5 text-[var(--foreground)] outline-none ring-cyan-500/40 transition-[border-color,box-shadow] duration-200 placeholder:text-[color:var(--field-placeholder)] focus:border-cyan-500/50 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };

