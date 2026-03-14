import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white rounded-xl hover:bg-brand-hover shadow-lg shadow-brand/20",
        secondary:
          "border border-white/10 bg-white/5 text-zinc-300 rounded-xl hover:bg-white/10 hover:text-white backdrop-blur-sm",
        outline:
          "border border-dark-border text-zinc-400 rounded-xl hover:bg-dark-hover hover:text-white",
        ghost:
          "text-zinc-400 hover:bg-white/5 hover:text-white rounded-xl",
        destructive:
          "bg-red-600/90 text-white rounded-xl hover:bg-red-600 shadow-lg shadow-red-900/20",
        glass:
          "bg-white/[0.06] backdrop-blur-md border border-white/10 text-white rounded-xl hover:bg-white/10 shadow-lg",
        link:
          "text-brand underline-offset-4 hover:underline hover:text-brand-light",
        // Pink / White / Black button variants
        pink:
          "bg-brand text-white rounded-xl hover:bg-brand-hover shadow-lg shadow-brand/25",
        white:
          "bg-white text-zinc-900 rounded-xl hover:bg-zinc-100 shadow-lg",
        black:
          "bg-zinc-900 text-white rounded-xl border border-white/10 hover:bg-zinc-800 shadow-lg",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm:      "h-8 px-3 text-xs",
        lg:      "h-12 px-8 text-base",
        icon:    "h-10 w-10",
        xs:      "h-7 px-2.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
