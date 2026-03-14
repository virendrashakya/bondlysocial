import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "rounded-2xl transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/20",
        elevated:
          "bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/30",
        subtle:
          "bg-white/[0.02] backdrop-blur-md border border-white/[0.06]",
        interactive:
          "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/20 hover:bg-white/[0.07] hover:border-white/[0.14] hover:shadow-2xl cursor-pointer",
        danger:
          "bg-red-950/20 backdrop-blur-xl border border-red-900/30",
        brand:
          "bg-brand/5 backdrop-blur-xl border border-brand/20",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-5",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
