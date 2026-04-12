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
        "flex min-h-[96px] w-full resize-y rounded-lg border border-white/15 bg-[#12081f]/80 px-3 py-2.5 text-zinc-100 outline-none ring-cyan-500/40 transition-[border-color,box-shadow] duration-200 placeholder:text-zinc-600 focus:border-cyan-500/50 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };

