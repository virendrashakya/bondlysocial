import clsx from "clsx";

const INTENT_CONFIG: Record<string, { label: string; color: string }> = {
  friendship:           { label: "Friendship",           color: "bg-sky-900/50 text-sky-300 border border-sky-700/50" },
  activity_partner:     { label: "Activity Partner",     color: "bg-emerald-900/50 text-emerald-300 border border-emerald-700/50" },
  networking:           { label: "Networking",           color: "bg-violet-900/50 text-violet-300 border border-violet-700/50" },
  emotional_support:    { label: "Emotional Support",    color: "bg-amber-900/50 text-amber-300 border border-amber-700/50" },
  serious_relationship: { label: "Serious Relationship", color: "bg-rose-900/50 text-rose-300 border border-rose-700/50" },
  marriage:             { label: "Marriage",             color: "bg-pink-900/50 text-pink-300 border border-pink-700/50" },
};

interface IntentBadgeProps {
  intent: string;
  size?: "sm" | "md";
}

export function IntentBadge({ intent, size = "md" }: IntentBadgeProps) {
  const config = INTENT_CONFIG[intent] ?? { label: intent, color: "bg-zinc-800 text-zinc-300 border border-zinc-700" };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium",
        config.color,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {config.label}
    </span>
  );
}
