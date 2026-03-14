import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  icon?: React.ReactNode;
  dangerous?: boolean;
}

export function ToggleRow({ label, description, checked, onCheckedChange, icon, dangerous }: ToggleRowProps) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-2.5 flex-1">
        {icon && <div className="mt-0.5 flex-shrink-0 text-zinc-500">{icon}</div>}
        <div>
          <label
            htmlFor={id}
            className={cn(
              "text-sm font-medium cursor-pointer",
              dangerous ? "text-rose-400" : "text-white"
            )}
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        dangerous={dangerous}
        aria-label={label}
      />
    </div>
  );
}
