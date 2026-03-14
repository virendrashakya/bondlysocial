import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { Shimmer } from "@/components/ui/Shimmer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IntentBadge } from "@/components/shared/IntentBadge";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useSuggestions, useConnect } from "@/hooks/queries";
import type { JsonApiResource, SuggestionProfile } from "@/types";
import { SearchX, X, Heart, ChevronDown, MapPin, Briefcase, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function DiscoverPage() {
  const navigate  = useNavigate();
  const appConfig = useAppConfig();

  const { data, isLoading, isError } = useSuggestions(appConfig.discover_enabled);
  const connect = useConnect();

  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [animating, setAnimating] = useState<"left" | "right" | null>(null);
  const [expanded, setExpanded] = useState(false);

  const rawProfiles: JsonApiResource<SuggestionProfile>[] = data ?? [];

  // Filter out passed/connected profiles
  const available = rawProfiles.filter(
    (p) => !passed.has(p.id) && !connected.has(p.id)
  );

  const currentProfile = available[0];
  const remainingCount = available.length;

  const handlePass = useCallback(() => {
    if (!currentProfile || animating) return;
    setAnimating("left");
    setExpanded(false);
    setTimeout(() => {
      setPassed((prev) => new Set(prev).add(currentProfile.id));
      setAnimating(null);
    }, 300);
  }, [currentProfile, animating]);

  const handleConnect = useCallback(() => {
    if (!currentProfile || animating) return;
    setAnimating("right");
    setExpanded(false);
    connect.mutate(Number(currentProfile.id), {
      onSuccess: () => toast.success(`Request sent to ${currentProfile.attributes.name}!`),
      onError: () => toast.error("Could not send request"),
    });
    setTimeout(() => {
      setConnected((prev) => new Set(prev).add(currentProfile.id));
      setAnimating(null);
    }, 300);
  }, [currentProfile, animating, connect]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePass();
      if (e.key === "ArrowRight") handleConnect();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlePass, handleConnect]);

  // ─── Disabled state ────────────────────────────────────────────────────
  if (!appConfig.discover_enabled) {
    return (
      <div className="relative flex flex-col items-center justify-center py-32 text-center px-4">
        <AuroraBg />
        <SearchX size={40} className="text-zinc-600 mb-4" />
        <p className="text-xl font-semibold text-white">Discover is paused</p>
        <p className="mt-2 text-sm text-zinc-500 max-w-xs">
          The admin has temporarily paused discovery. Check back soon.
        </p>
      </div>
    );
  }

  // ─── Loading ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-4">
        <AuroraBg />
        <div className="w-full max-w-sm">
          <Shimmer className="h-[70vh] w-full rounded-3xl" />
          <div className="flex justify-center gap-6 mt-6">
            <Shimmer className="h-14 w-14 rounded-full" />
            <Shimmer className="h-14 w-14 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="relative flex flex-col items-center justify-center py-24 text-zinc-500">
        <AuroraBg />
        <p>Something went wrong. Please refresh.</p>
      </div>
    );
  }

  // ─── No more profiles ─────────────────────────────────────────────────
  if (!currentProfile) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <AuroraBg />
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center mb-4">
          <Sparkles size={32} className="text-brand" />
        </div>
        <p className="text-2xl font-bold text-white">You're all caught up!</p>
        <p className="mt-2 text-sm text-zinc-500 max-w-xs">
          No more profiles for now. We'll surface more people matching your intent tomorrow.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            setPassed(new Set());
            setConnected(new Set());
          }}
        >
          Start over
        </Button>
      </div>
    );
  }

  const p = currentProfile.attributes;
  const score = p.match_score;

  return (
    <div className="relative flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-4">
      <AuroraBg />

      {/* Counter */}
      <div className="w-full max-w-sm flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold text-white">Discover</h1>
        <span className="text-xs text-zinc-500">{remainingCount} left today</span>
      </div>

      {/* Card */}
      <div
        className={cn(
          "relative w-full max-w-sm rounded-3xl overflow-hidden transition-all duration-300 shadow-2xl shadow-black/40",
          animating === "left" && "translate-x-[-120%] rotate-[-8deg] opacity-0",
          animating === "right" && "translate-x-[120%] rotate-[8deg] opacity-0",
          !animating && "translate-x-0 rotate-0 opacity-100"
        )}
      >
        {/* Full-screen photo */}
        <div className={cn("relative", expanded ? "h-[55vh]" : "h-[68vh]")}>
          {p.avatar_url ? (
            <img
              src={p.avatar_url}
              alt={p.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-muted to-dark-hover">
              <span className="text-8xl font-black text-brand/20">{p.name?.[0]?.toUpperCase()}</span>
            </div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            {score !== undefined && score > 0 && (
              <Badge variant="glass" size="sm" className="text-brand font-bold">
                <Sparkles size={11} />
                {score}% match
              </Badge>
            )}
            {p.verified && (
              <Badge variant="glass" size="sm" className="text-emerald-400 ml-auto">
                <ShieldCheck size={11} />
                Verified
              </Badge>
            )}
          </div>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                  {p.name}{p.age ? `, ${p.age}` : ""}
                </h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {p.city && (
                    <span className="flex items-center gap-1 text-sm text-white/80">
                      <MapPin size={13} />
                      {p.city}
                    </span>
                  )}
                  {p.occupation && (
                    <span className="flex items-center gap-1 text-sm text-white/60">
                      <Briefcase size={13} />
                      {p.occupation}
                    </span>
                  )}
                </div>
              </div>
              <IntentBadge intent={p.intent} />
            </div>

            {/* Expand trigger */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
            >
              <ChevronDown
                size={14}
                className={cn("transition-transform", expanded && "rotate-180")}
              />
              {expanded ? "Show less" : `More about ${p.name?.split(" ")[0]}`}
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="bg-[rgba(12,12,12,0.98)] px-5 py-5 space-y-4 animate-fade-in">
            {/* Bio */}
            {p.bio && (
              <p className="text-sm text-zinc-300 leading-relaxed">{p.bio}</p>
            )}

            {/* Interests */}
            {p.interests && p.interests.length > 0 && (
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.interests.map((interest: string) => (
                    <Badge key={interest} variant="default" size="sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Details grid */}
            {(p.height_cm || p.body_type || p.drinking || p.workout_frequency) && (
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium mb-2">About</p>
                <div className="grid grid-cols-2 gap-2">
                  {p.height_cm && (
                    <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <span className="text-[10px] text-zinc-600 block">Height</span>
                      <span className="text-xs text-zinc-300">{p.height_cm} cm</span>
                    </div>
                  )}
                  {p.body_type && (
                    <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <span className="text-[10px] text-zinc-600 block">Build</span>
                      <span className="text-xs text-zinc-300 capitalize">{p.body_type}</span>
                    </div>
                  )}
                  {p.drinking && (
                    <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <span className="text-[10px] text-zinc-600 block">Drinks</span>
                      <span className="text-xs text-zinc-300 capitalize">{p.drinking}</span>
                    </div>
                  )}
                  {p.workout_frequency && (
                    <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <span className="text-[10px] text-zinc-600 block">Workout</span>
                      <span className="text-xs text-zinc-300 capitalize">{p.workout_frequency}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View full profile link */}
            <Button
              variant="glass"
              size="sm"
              className="w-full"
              onClick={() => navigate(`/profile/${currentProfile.id}`)}
            >
              View full profile
            </Button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-8 mt-6">
        {/* Pass */}
        <button
          onClick={handlePass}
          disabled={!!animating}
          className={cn(
            "w-14 h-14 rounded-full border-2 border-zinc-700 flex items-center justify-center",
            "text-zinc-400 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10",
            "transition-all active:scale-90",
            animating && "opacity-50 pointer-events-none"
          )}
          aria-label="Pass"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        {/* Connect */}
        <button
          onClick={handleConnect}
          disabled={!!animating}
          className={cn(
            "w-16 h-16 rounded-full bg-gradient-to-br from-brand to-pink-500 flex items-center justify-center",
            "text-white shadow-lg shadow-brand/30",
            "hover:shadow-brand/50 hover:scale-105",
            "transition-all active:scale-90",
            animating && "opacity-50 pointer-events-none"
          )}
          aria-label="Connect"
        >
          <Heart size={26} strokeWidth={2.5} fill="currentColor" />
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-[10px] text-zinc-700 mt-3 hidden md:block">
        ← pass · → connect
      </p>
    </div>
  );
}
