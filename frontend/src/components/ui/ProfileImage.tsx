import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProfileImageProps {
  src?: string | null;
  name?: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * Image component with automatic initials fallback.
 * When `src` is missing or fails to load, shows a gradient background
 * with the user's initial.
 */
export function ProfileImage({ src, name, className, fallbackClassName }: ProfileImageProps) {
  const [failed, setFailed] = useState(false);
  const initial = name?.[0]?.toUpperCase() ?? "?";

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-brand/30 via-brand-muted to-violet-900/30",
          className,
          fallbackClassName
        )}
        aria-hidden="true"
      >
        <span className="font-black text-brand/40 select-none" style={{ fontSize: "clamp(1.5rem, 25%, 8rem)" }}>
          {initial}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ?? ""}
      className={cn("object-cover", className)}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
