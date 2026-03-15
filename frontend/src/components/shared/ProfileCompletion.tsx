import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props {
  profile?: {
    name?: string; bio?: string; avatar_url?: string; interests?: string[];
    occupation?: string; cultural_background?: string; height_cm?: number;
    languages_spoken?: string[];
  };
  verified?: boolean;
}

function calc(profile?: Props["profile"], verified?: boolean): number {
  if (!profile) return 0;
  const checks = [
    !!profile.name,
    !!profile.bio,
    !!profile.avatar_url,
    (profile.interests?.length ?? 0) >= 3,
    !!profile.occupation,
    !!verified,
    !!profile.cultural_background,
    !!profile.height_cm,
    (profile.languages_spoken?.length ?? 0) >= 1,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function ProfileCompletion({ profile, verified }: Props) {
  const pct = calc(profile, verified);
  if (pct >= 100) return null;

  return (
    <NavLink
      to="/settings"
      className={cn(
        "block px-4 py-3 border-b border-dark-border hover:bg-dark-hover/50 transition-colors group"
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-zinc-500 font-medium group-hover:text-zinc-300 transition-colors">
          Profile {pct}% complete
        </span>
        <span className="text-[10px] text-brand font-semibold">Finish →</span>
      </div>
      <div className="h-1 bg-dark-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #FF3D6B, #FF6B8A)",
          }}
        />
      </div>
    </NavLink>
  );
}
