import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border border-neutral-950-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 dark:border-neutral-950-800 dark:focus:ring-neutral-950-300",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-neutral-950-900 text-neutral-950-50 shadow hover:bg-neutral-950-900/80 dark:bg-neutral-950-50 dark:text-neutral-950-900 dark:hover:bg-neutral-950-50/80",
        secondary:
          "border-transparent bg-neutral-950-100 text-neutral-950-900 hover:bg-neutral-950-100/80 dark:bg-neutral-950-800 dark:text-neutral-950-50 dark:hover:bg-neutral-950-800/80",
        destructive:
          "border-transparent bg-red-500 text-neutral-950-50 shadow hover:bg-red-500/80 dark:bg-red-900 dark:text-neutral-950-50 dark:hover:bg-red-900/80",
        outline: "text-neutral-950 dark:text-neutral-950-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
