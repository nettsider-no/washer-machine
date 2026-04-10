"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-lg border border-white/15 bg-[#12081f]/80 px-3 py-2.5 text-zinc-100 outline-none ring-cyan-500/40 placeholder:text-zinc-600 focus:border-cyan-500/50 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export { Input };

