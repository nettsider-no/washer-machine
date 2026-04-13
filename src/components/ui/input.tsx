"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-lg border border-[var(--border)] bg-[color:var(--field)] px-3 py-2.5 text-[var(--foreground)] outline-none ring-cyan-500/40 transition-[border-color,box-shadow] duration-200 placeholder:text-[color:var(--field-placeholder)] focus:border-cyan-500/50 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export { Input };

