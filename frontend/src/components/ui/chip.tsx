import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-medium transition-all cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "border border-white/10 text-zinc-400 hover:border-zinc-500 hover:text-white",
        active:
          "bg-brand text-white border border-brand shadow-sm shadow-brand/20",
        activeViolet:
          "bg-violet-600 text-white border border-violet-500 shadow-sm shadow-violet-900/20",
        activeWhite:
          "bg-white text-zinc-900 border border-white shadow-sm",
        disabled:
          "border border-white/5 text-zinc-600 opacity-30 cursor-not-allowed",
      },
      size: {
        sm: "px-2.5 py-1 text-[11px]",
        default: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  active?: boolean;
  activeVariant?: "active" | "activeViolet" | "activeWhite";
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, size, active, activeVariant = "active", disabled, ...props }, ref) => {
    const resolvedVariant = disabled ? "disabled" : active ? activeVariant : (variant ?? "default");
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(chipVariants({ variant: resolvedVariant, size, className }))}
        {...props}
      />
    );
  }
);
Chip.displayName = "Chip";

// Button group for equal-width radio buttons (drinking/smoking/workout)
interface ButtonGroupOption {
  value: string;
  label: string;
}

interface ButtonGroupProps {
  options: readonly ButtonGroupOption[];
  value?: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

function ButtonGroup({ options, value, onChange, ariaLabel }: ButtonGroupProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(value === o.value ? "" : o.value)}
          className={cn(
            "flex-1 py-2.5 text-xs rounded-xl border font-medium transition-all text-center",
            value === o.value
              ? "bg-brand text-white border-brand shadow-sm shadow-brand/20"
              : "border-white/10 text-zinc-400 hover:border-zinc-500 hover:text-white bg-white/[0.02]"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export { Chip, chipVariants, ButtonGroup };
