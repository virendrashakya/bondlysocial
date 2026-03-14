import { ShieldCheck } from "lucide-react";
import { IntentBadge } from "./IntentBadge";
import { Profile } from "@/services/profiles.service";
import { formatDistanceToNow } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserCardProps {
  profile: Profile & { match_score?: number; last_seen_at?: string };
  onConnect?: () => void;
  onView?: () => void;
  loading?: boolean;
}

function getMatchTier(score: number): { label: string; color: string; bar: string; icon: string } {
  if (score >= 80) return { label: "Excellent match",  color: "text-emerald-400", bar: "bg-emerald-400", icon: "fa-solid fa-bolt"         };
  if (score >= 60) return { label: "Great match",      color: "text-brand",       bar: "bg-brand",       icon: "fa-solid fa-fire"          };
  if (score >= 40) return { label: "Good match",       color: "text-amber-400",   bar: "bg-amber-400",   icon: "fa-solid fa-thumbs-up"     };
  return              { label: "Some compatibility", color: "text-zinc-400",   bar: "bg-zinc-500",    icon: "fa-solid fa-circle-check"  };
}

function OnlineStatus({ lastSeenAt }: { lastSeenAt?: string }) {
  if (!lastSeenAt) return null;
  const minsAgo = (Date.now() - new Date(lastSeenAt).getTime()) / 60000;
  if (minsAgo < 5) {
    return (
      <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-medium" aria-label="Online now">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
        Online now
      </span>
    );
  }
  if (minsAgo < 120) {
    return (
      <span className="text-[10px] text-zinc-500">
        {formatDistanceToNow(new Date(lastSeenAt), { addSuffix: true })}
      </span>
    );
  }
  return null;
}

export function UserCard({ profile, onConnect, onView, loading }: UserCardProps) {
  const score = profile.match_score;
  const tier  = score !== undefined ? getMatchTier(score) : null;

  return (
    <GlassCard
      variant="interactive"
      padding="none"
      className="overflow-hidden group animate-page-enter"
      role="article"
      aria-label={`${profile.name}, ${profile.age}. ${tier?.label ?? ""}`}
    >
      {/* Avatar */}
      <div className="relative overflow-hidden">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={`Profile photo of ${profile.name}`}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-52 flex items-center justify-center bg-gradient-to-br from-brand-muted to-dark-hover" aria-hidden="true">
            <span className="text-6xl font-black text-brand/20">{profile.name?.[0]?.toUpperCase()}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent" aria-hidden="true" />

        {/* AI match badge */}
        {score !== undefined && score > 0 && tier && (
          <Badge
            variant="glass"
            size="sm"
            className={cn("absolute top-2.5 left-2.5", tier.color)}
            aria-label={`${score}% match — ${tier.label}`}
          >
            <i className={cn(tier.icon, "text-[9px]")} aria-hidden="true" />
            <span className="font-bold">{score}%</span>
          </Badge>
        )}

        {/* Verified */}
        {profile.verified && (
          <Badge
            variant="success"
            size="sm"
            className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md"
            aria-label="Verified profile"
          >
            <ShieldCheck size={11} aria-hidden="true" />
            Verified
          </Badge>
        )}

        {/* Name + status overlaid */}
        <div className="absolute bottom-2.5 left-3 right-3">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-sm font-bold text-white drop-shadow-lg">{profile.name}, {profile.age}</h3>
              <OnlineStatus lastSeenAt={profile.last_seen_at} />
            </div>
            <IntentBadge intent={profile.intent} size="sm" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2.5">
        <p className="text-xs text-zinc-500 flex items-center gap-1">
          <i className="fa-solid fa-location-dot text-[10px]" aria-hidden="true" />
          {profile.city}
        </p>

        {profile.bio && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{profile.bio}</p>
        )}

        {/* AI match bar */}
        {score !== undefined && score > 0 && tier && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <i className="fa-solid fa-brain text-[9px]" aria-hidden="true" />
                IntentAI compatibility
              </span>
              <span className={cn("text-[10px] font-semibold", tier.color)}>{tier.label}</span>
            </div>
            <div className="h-1 bg-dark-hover rounded-full overflow-hidden" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`${score}% compatibility`}>
              <div className={cn("h-full rounded-full transition-all", tier.bar)} style={{ width: `${score}%` }} />
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1" aria-label="Interests">
            {profile.interests.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="default" size="sm">
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 3 && (
              <span className="text-[10px] text-zinc-600">+{profile.interests.length - 3} more</span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-0.5">
          {onView && (
            <Button
              variant="glass"
              size="sm"
              onClick={onView}
              aria-label={`View ${profile.name}'s profile`}
              className="flex-1"
            >
              <i className="fa-regular fa-eye text-[10px]" aria-hidden="true" />
              View
            </Button>
          )}
          {onConnect && (
            <Button
              onClick={onConnect}
              disabled={loading}
              size="sm"
              aria-label={`Send connection request to ${profile.name}`}
              className="flex-1"
            >
              {loading ? (
                <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <i className="fa-solid fa-user-plus text-[10px]" aria-hidden="true" />
                  Connect
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
