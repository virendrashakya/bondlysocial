import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ icon, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <h2 className="font-semibold text-white flex items-center gap-2">
        {icon && <span className="text-zinc-500">{icon}</span>}
        {title}
      </h2>
      {description && (
        <p className="text-xs text-zinc-500">{description}</p>
      )}
    </div>
  );
}
