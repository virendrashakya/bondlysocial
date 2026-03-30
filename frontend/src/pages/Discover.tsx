import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { Shimmer } from "@/components/ui/Shimmer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IntentBadge } from "@/components/shared/IntentBadge";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useSuggestions, useConnect, usePass } from "@/hooks/queries";
import { usePreferences, useUpdateDiscoveryPrefs } from "@/hooks/queries";
import type { JsonApiResource, SuggestionProfile, DiscoveryPreferences } from "@/types";
import { SearchX, X, Heart, ChevronDown, MapPin, Briefcase, ShieldCheck, Sparkles, SlidersHorizontal, Eye } from "lucide-react";
import { ProfileImage } from "@/components/ui/ProfileImage";
import { MatchCelebration } from "@/components/shared/MatchCelebration";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const CITIES = ["Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Ahmedabad", "Goa"];
const INTENTS = [
  { value: "friendship", label: "Friendship" },
  { value: "serious_relationship", label: "Serious Relationship" },
  { value: "networking", label: "Networking" },
  { value: "activity_partner", label: "Activity Partner" },
  { value: "emotional_support", label: "Emotional Support" },
  { value: "marriage", label: "Marriage" },
];

export function DiscoverPage() {
  const navigate  = useNavigate();
  const appConfig = useAppConfig();

  const { data, isLoading, isError } = useSuggestions(appConfig.discover_enabled);
  const connect = useConnect();
  const pass    = usePass();
  const { data: prefs } = usePreferences();
  const updateDiscovery = useUpdateDiscoveryPrefs();

  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [animating, setAnimating] = useState<"left" | "right" | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [celebration, setCelebration] = useState<{ name: string; avatarUrl?: string } | null>(null);

  const controls = useAnimation();

  // Local filter state — initialized from server prefs
  const [filterGender, setFilterGender] = useState<string>("");
  const [filterAgeMin, setFilterAgeMin] = useState<string>("");
  const [filterAgeMax, setFilterAgeMax] = useState<string>("");
  const [filterCities, setFilterCities] = useState<string[]>([]);
  const [filterIntents, setFilterIntents] = useState<string[]>([]);

  // Sync local state from server prefs on load
  useEffect(() => {
    if (prefs?.discovery) {
      setFilterGender(prefs.discovery.preferred_gender || "");
      setFilterAgeMin(prefs.discovery.age_min ? String(prefs.discovery.age_min) : "");
      setFilterAgeMax(prefs.discovery.age_max ? String(prefs.discovery.age_max) : "");
      setFilterCities(prefs.discovery.preferred_cities || []);
      setFilterIntents(prefs.discovery.preferred_intents || []);
    }
  }, [prefs?.discovery]);

  const handleSaveFilters = () => {
    const discovery: DiscoveryPreferences = {
      preferred_gender: filterGender || undefined,
      age_min: filterAgeMin ? Number(filterAgeMin) : undefined,
      age_max: filterAgeMax ? Number(filterAgeMax) : undefined,
      preferred_cities: filterCities.length > 0 ? filterCities : undefined,
      preferred_intents: filterIntents.length > 0 ? filterIntents : undefined,
    };
    // Clear undefined keys so the server resets them
    const cleaned = Object.fromEntries(
      Object.entries(discovery).filter(([, v]) => v !== undefined)
    );
    updateDiscovery.mutate(cleaned as DiscoveryPreferences);
    setShowFilters(false);
    // Reset local swipe state since we're getting new suggestions
    setPassed(new Set());
    setConnected(new Set());
  };

  const handleResetFilters = () => {
    setFilterGender("");
    setFilterAgeMin("");
    setFilterAgeMax("");
    setFilterCities([]);
    setFilterIntents([]);
    updateDiscovery.mutate({
      preferred_gender: "",
      age_min: 0,
      age_max: 0,
      preferred_cities: [],
      preferred_intents: [],
    } as unknown as DiscoveryPreferences);
    setShowFilters(false);
    setPassed(new Set());
    setConnected(new Set());
  };

  const toggleCity = (city: string) => {
    setFilterCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const toggleIntent = (intent: string) => {
    setFilterIntents(prev =>
      prev.includes(intent) ? prev.filter(i => i !== intent) : [...prev, intent]
    );
  };

  const hasActiveFilters = !!(filterGender || filterAgeMin || filterAgeMax || filterCities.length || filterIntents.length);

  const rawProfiles: JsonApiResource<SuggestionProfile>[] = data ?? [];

  // Filter out passed/connected profiles
  const available = rawProfiles.filter(
    (p) => !passed.has(p.id) && !connected.has(p.id)
  );

  const currentProfile = available[0];
  const remainingCount = available.length;

  const handlePass = useCallback(async () => {
    if (!currentProfile || animating) return;
    setAnimating("left");
    setExpanded(false);
    await controls.start({ x: -window.innerWidth, rotate: -15, opacity: 0, transition: { duration: 0.3 } });
    pass.mutate(Number(currentProfile.attributes.user_id));
    setPassed((prev) => new Set(prev).add(currentProfile.id));
    setAnimating(null);
    controls.set({ x: 0, rotate: 0, opacity: 1 });
  }, [currentProfile, animating, pass, controls]);

  const handleConnect = useCallback(async () => {
    if (!currentProfile || animating) return;
    const profile = currentProfile.attributes;
    setAnimating("right");
    setExpanded(false);
    await controls.start({ x: window.innerWidth, rotate: 15, opacity: 0, transition: { duration: 0.3 } });
    connect.mutate(Number(profile.user_id), {
      onSuccess: () => {
        setCelebration({ name: profile.name, avatarUrl: profile.avatar_url });
      },
      onError: () => toast.error("Could not send request"),
    });
    setConnected((prev) => new Set(prev).add(currentProfile.id));
    setAnimating(null);
    controls.set({ x: 0, rotate: 0, opacity: 1 });
  }, [currentProfile, animating, connect, controls]);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100;
      const velocity_threshold = 500;
      // Dragged right past threshold
      if (info.offset.x > threshold || info.velocity.x > velocity_threshold) {
        handleConnect();
      } 
      // Dragged left past threshold
      else if (info.offset.x < -threshold || info.velocity.x < -velocity_threshold) {
        handlePass();
      } 
      // Snap back
      else {
        controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
      }
    },
    [handleConnect, handlePass, controls]
  );

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
      <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AuroraBg />
        <img
          src="/illustrations/signup-hero.png"
          alt=""
          className="w-36 h-auto object-contain mb-2 opacity-80"
        />
        <p className="text-2xl font-bold text-gradient">You're all caught up!</p>
        <p className="mt-2 text-sm text-zinc-500 max-w-xs">
          No more profiles right now. Adjust your filters or check back later for new people.
        </p>
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setPassed(new Set());
              setConnected(new Set());
            }}
          >
            Start over
          </Button>
          <Button
            variant="pink"
            onClick={() => setShowFilters(true)}
            className="animate-glow-pulse"
          >
            <SlidersHorizontal size={15} />
            Adjust Filters
          </Button>
        </div>
      </div>
    );
  }

  const p = currentProfile.attributes;
  const score = p.match_score;

  return (
    <div className="relative flex flex-col items-center px-2 sm:px-4 py-1 sm:py-3 md:h-full md:overflow-hidden">
      <AuroraBg />

      {/* Counter + Filter toggle */}
      <div className="w-full max-w-md flex items-center justify-between mb-1">
        <h1 className="text-lg font-bold text-gradient">Discover</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{remainingCount} left today</span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              hasActiveFilters
                ? "bg-brand/20 text-brand"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
            title="Filter preferences"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="w-full max-w-md mb-3 rounded-2xl bg-dark-surface/95 border border-white/[0.08] p-4 space-y-4 animate-fade-in backdrop-blur-lg z-10">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Discovery Preferences</p>

          {/* Gender */}
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Show me</label>
            <div className="flex gap-2">
              {[{ value: "", label: "Everyone" }, { value: "female", label: "Women" }, { value: "male", label: "Men" }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterGender(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    filterGender === opt.value
                      ? "bg-brand text-white"
                      : "bg-white/[0.06] text-zinc-400 hover:bg-white/10"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Age range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={18}
                max={60}
                placeholder="Min"
                value={filterAgeMin}
                onChange={e => setFilterAgeMin(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-brand/50"
              />
              <span className="text-zinc-600 text-xs">to</span>
              <input
                type="number"
                min={18}
                max={60}
                placeholder="Max"
                value={filterAgeMax}
                onChange={e => setFilterAgeMax(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-brand/50"
              />
            </div>
          </div>

          {/* Cities */}
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Cities</label>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => toggleCity(city)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                    filterCities.includes(city)
                      ? "bg-brand/20 text-brand border border-brand/30"
                      : "bg-white/[0.06] text-zinc-500 hover:bg-white/10"
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Intents */}
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Looking for</label>
            <div className="flex flex-wrap gap-1.5">
              {INTENTS.map(intent => (
                <button
                  key={intent.value}
                  onClick={() => toggleIntent(intent.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                    filterIntents.includes(intent.value)
                      ? "bg-brand/20 text-brand border border-brand/30"
                      : "bg-white/[0.06] text-zinc-500 hover:bg-white/10"
                  )}
                >
                  {intent.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="pink"
              size="sm"
              className="flex-1"
              onClick={handleSaveFilters}
              disabled={updateDiscovery.isPending}
            >
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="glass"
                size="sm"
                onClick={handleResetFilters}
                disabled={updateDiscovery.isPending}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Card — 9:16 aspect ratio fills viewport on mobile */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={(e, info) => { setDragX(0); handleDragEnd(e, info); }}
        animate={controls}
        whileDrag={{ cursor: "grabbing" }}
        style={{ touchAction: "none" }}
        className={cn(
          "relative w-full max-w-md rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/40 cursor-grab active:cursor-grabbing",
          "max-h-[calc(100dvh-130px)] sm:max-h-[calc(100dvh-150px)] md:max-h-[calc(100vh-180px)]",
          !animating && "transition-none",
          animating === "left" && "pointer-events-none",
          animating === "right" && "pointer-events-none"
        )}
      >
        {/* ── Swipe direction overlay labels ── */}
        {dragX > 30 && (
          <div
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
            style={{ opacity: Math.min(Math.abs(dragX) / 150, 1) }}
          >
            <div className="absolute top-8 left-6 rotate-[-20deg] border-4 border-emerald-400 rounded-xl px-5 py-2">
              <span className="text-3xl font-black text-emerald-400 tracking-wider">LIKE</span>
            </div>
          </div>
        )}
        {dragX < -30 && (
          <div
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
            style={{ opacity: Math.min(Math.abs(dragX) / 150, 1) }}
          >
            <div className="absolute top-8 right-6 rotate-[20deg] border-4 border-red-400 rounded-xl px-5 py-2">
              <span className="text-3xl font-black text-red-400 tracking-wider">NOPE</span>
            </div>
          </div>
        )}
        {/* Photo — 9:16 aspect on mobile, constrained by card max-h */}
        <div className={cn(
          "relative w-full",
          expanded
            ? "aspect-[9/12] sm:aspect-[9/13] md:h-[calc(100vh-360px)]"
            : "aspect-[9/16] md:h-[calc(100vh-200px)]"
        )}>
          <ProfileImage
            src={p.avatar_url}
            name={p.name}
            className="w-full h-full"
          />

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

          {/* Bottom info overlay — positioned above the action buttons */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-20">
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

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
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
              onClick={() => navigate(`/profile/${p.user_id}`)}
            >
              View full profile
            </Button>
          </div>
        )}
        {/* ── Action buttons — overlaid at bottom of card ── */}
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-5 pb-4 pt-16 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none">
            {/* Pass */}
            <button
              onClick={handlePass}
              disabled={!!animating}
              className={cn(
                "pointer-events-auto w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-white/30 bg-black/40 backdrop-blur-sm flex items-center justify-center",
                "text-white/80 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10",
                "transition-all active:scale-90",
                animating && "opacity-50 pointer-events-none"
              )}
              style={{ width: 52, height: 52 }}
              aria-label="Pass"
            >
              <X size={22} strokeWidth={2.5} />
            </button>

            {/* Connect */}
            <button
              onClick={handleConnect}
              disabled={!!animating}
              className={cn(
                "pointer-events-auto w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-brand to-pink-500 flex items-center justify-center",
                "text-white shadow-lg shadow-brand/30 animate-glow-pulse",
                "hover:shadow-brand/50 hover:scale-105",
                "transition-all active:scale-90",
                animating && "opacity-50 pointer-events-none"
              )}
              style={{ width: 58, height: 58 }}
              aria-label="Connect"
            >
              <Heart size={24} strokeWidth={2.5} fill="currentColor" />
            </button>

            {/* View Profile */}
            <button
              onClick={() => navigate(`/profile/${p.user_id}`)}
              className={cn(
                "pointer-events-auto rounded-full border-2 border-white/30 bg-black/40 backdrop-blur-sm flex items-center justify-center",
                "text-white/80 hover:text-brand hover:border-brand/50",
                "transition-all active:scale-90"
              )}
              style={{ width: 52, height: 52 }}
              aria-label="View profile"
            >
              <Eye size={20} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Swipe hint — below card, minimal space */}
      <p className="text-[10px] text-zinc-700 mt-1 md:hidden">swipe left to pass · swipe right to like</p>
      <p className="text-[10px] text-zinc-700 mt-1 hidden md:block">← pass · → connect</p>

      {/* Match celebration overlay */}
      {celebration && (
        <MatchCelebration
          name={celebration.name}
          avatarUrl={celebration.avatarUrl}
          onDismiss={() => setCelebration(null)}
        />
      )}
    </div>
  );
}
