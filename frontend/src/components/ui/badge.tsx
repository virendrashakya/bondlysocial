import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-white/[0.06] text-zinc-300 border border-white/[0.08]",
        brand:
          "bg-brand/15 text-brand border border-brand/25",
        success:
          "bg-emerald-900/40 text-emerald-400 border border-emerald-700/40",
        warning:
          "bg-amber-900/40 text-amber-400 border border-amber-700/40",
        danger:
          "bg-red-900/40 text-red-400 border border-red-700/40",
        violet:
          "bg-violet-900/20 text-violet-400 border border-violet-800/30",
        info:
          "bg-sky-900/30 text-sky-400 border border-sky-700/30",
        glass:
          "bg-white/[0.06] backdrop-blur-md text-white border border-white/10",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
