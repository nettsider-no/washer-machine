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
        "flex min-h-[96px] w-full resize-y rounded-lg border border-[var(--border)] bg-[color:var(--field)] px-3 py-2.5 text-[var(--foreground)] outline-none ring-[color:var(--focus-ring)] transition-[border-color,box-shadow] duration-200 placeholder:text-[color:var(--field-placeholder)] focus:border-[color:var(--accent-border)] focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };

