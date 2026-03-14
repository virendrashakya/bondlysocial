import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, RefreshCw, Locate } from "lucide-react";
import { profilesService } from "@/services/profiles.service";
import { api } from "@/lib/api";
import { UserCard } from "@/components/shared/UserCard";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { Shimmer } from "@/components/ui/Shimmer";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

type GeoState = "idle" | "requesting" | "granted" | "denied" | "error";

function CardSkeleton() {
  return (
    <GlassCard padding="none" className="overflow-hidden">
      <Shimmer className="h-52 w-full rounded-none" />
      <div className="p-3.5 space-y-2.5">
        <Shimmer className="h-3.5 w-28" />
        <Shimmer className="h-3 w-full" />
        <div className="flex gap-2 pt-0.5">
          <Shimmer className="h-8 flex-1 rounded-xl" />
          <Shimmer className="h-8 flex-1 rounded-xl" />
        </div>
      </div>
    </GlassCard>
  );
}

export function NearbyPage() {
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const [geo, setGeo] = useState<GeoState>("idle");
  const [city, setCity] = useState<string>("");
  const [radius, setRadius] = useState(25); // km cosmetic slider

  // Attempt to read saved city from profile context
  useEffect(() => {
    // Try to detect city from profile or prompt geo
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeo("error");
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setGeo("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeo("granted");
        // Reverse geocode using Open-Meteo Geocoding (free, no key)
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const detected = data.address?.city || data.address?.town || data.address?.county || "";
          if (detected) {
            setCity(detected);
            toast.success(`Location detected: ${detected}`);
          }
        } catch {
          // Geo coordinates obtained but reverse geocode failed – still show city input
        }
      },
      (err) => {
        setGeo(err.code === 1 ? "denied" : "error");
        if (err.code === 1) toast.error("Location access denied. You can type your city manually.");
      },
      { timeout: 10000 }
    );
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["nearby", city, radius],
    queryFn:  () =>
      api.get("/profiles/nearby", { params: { city, radius } })
         .then((r) => r.data.profiles?.data ?? []),
    enabled: city.length >= 2,
  });

  const connect = useMutation({
    mutationFn: (receiverId: number) => api.post("/connections", { receiver_id: receiverId }),
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["nearby"] });
    },
    onError: () => toast.error("Could not send request."),
  });

  const profiles = data ?? [];

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-6">
      <AuroraBg />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-location-crosshairs text-brand" aria-hidden="true" />
          Nearby People
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">Discover people close to you</p>
      </div>

      {/* Location controls */}
      <GlassCard padding="sm" className="mb-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10" aria-hidden="true" />
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city…"
              aria-label="City"
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={requestLocation}
            disabled={geo === "requesting"}
            aria-label={geo === "requesting" ? "Detecting location…" : "Use my location"}
          >
            {geo === "requesting" ? (
              <div className="w-4 h-4 border border-brand border-t-transparent rounded-full animate-spin" />
            ) : (
              <Locate size={15} aria-hidden="true" />
            )}
            {geo === "requesting" ? "Detecting…" : "Use location"}
          </Button>
        </div>

        {/* Radius slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-500">Search radius</Label>
            <span className="text-xs font-semibold text-white">{radius} km</span>
          </div>
          <Slider
            value={[radius]}
            onValueChange={([v]) => setRadius(v)}
            min={5}
            max={100}
            step={5}
            aria-label={`Search radius: ${radius} km`}
          />
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>5 km</span><span>50 km</span><span>100 km</span>
          </div>
        </div>
      </GlassCard>

      {/* Status messages */}
      {geo === "denied" && (
        <GlassCard variant="danger" padding="sm" className="mb-4 flex items-start gap-3" role="alert">
          <i className="fa-solid fa-triangle-exclamation text-amber-400 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-white">Location access denied</p>
            <p className="text-xs text-zinc-500 mt-0.5">Type your city in the field above to find nearby people.</p>
          </div>
        </GlassCard>
      )}

      {city.length < 2 && geo !== "requesting" && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="w-20 h-20 rounded-3xl bg-brand-muted border border-brand-border flex items-center justify-center mb-5">
            <Navigation size={32} className="text-brand" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Find people near you</h2>
          <p className="text-sm text-zinc-500 max-w-xs">
            Enter your city or tap "Use location" to discover IntentConnect members nearby.
          </p>
        </div>
      )}

      {/* Results */}
      {isLoading && city.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-16 gap-3" role="alert">
          <p className="text-sm text-zinc-500">Couldn't load nearby people.</p>
          <Button variant="secondary" onClick={() => refetch()}>
            <RefreshCw size={14} /> Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && city.length >= 2 && profiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <i className="fa-solid fa-person-circle-question text-4xl text-zinc-700 mb-4" aria-hidden="true" />
          <p className="text-white font-semibold">No one nearby yet</p>
          <p className="text-sm text-zinc-500 mt-1 max-w-xs">
            No profiles found in {city}. Try increasing the radius or a different city.
          </p>
        </div>
      )}

      {profiles.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-500">
              <span className="text-white font-semibold">{profiles.length}</span> people near {city}
            </p>
            <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh results">
              <RefreshCw size={14} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p: any) => (
              <UserCard
                key={p.id}
                profile={{ id: Number(p.id), ...p.attributes }}
                onView={() => navigate(`/profile/${p.id}`)}
                onConnect={() => connect.mutate(Number(p.id))}
                loading={connect.isPending}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
