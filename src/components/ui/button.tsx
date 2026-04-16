"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition duration-200 active:translate-y-px active:scale-[0.98] motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--accent)] text-white shadow-[0_18px_40px_-18px_rgba(2,6,23,0.55)] hover:brightness-[1.05]",
        secondary:
          "border border-[var(--border)] bg-[color:var(--surface)] text-[var(--foreground)] hover:bg-[color:var(--surface-hover)]",
        ghost: "text-[var(--foreground)] hover:bg-[color:var(--surface-hover)]",
        destructive:
          "bg-[color:var(--danger)] text-white hover:brightness-[1.05] focus-visible:ring-[color:var(--danger-border)]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

