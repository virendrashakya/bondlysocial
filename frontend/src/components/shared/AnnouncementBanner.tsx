import { Megaphone, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props { text: string }

export function AnnouncementBanner({ text }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (!text || dismissed) return null;

  return (
    <div className={cn(
      "relative flex items-center justify-center gap-2 px-10 py-2.5 text-sm font-medium text-white",
      "bg-gradient-to-r from-brand/80 via-brand to-brand/80 border-b border-brand/30"
    )}>
      <Megaphone size={14} className="flex-shrink-0" />
      <span>{text}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 text-white/60 hover:text-white transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
