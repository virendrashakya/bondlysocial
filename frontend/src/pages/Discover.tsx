import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profilesService } from "../services/profiles.service";
import { api } from "../lib/api";
import { UserCard } from "../components/shared/UserCard";
import { StoryStrip } from "../components/shared/StoryStrip";
import { AuroraBg } from "../components/ui/AuroraBg";
import { Shimmer } from "../components/ui/Shimmer";
import { useNavigate } from "react-router-dom";
import { useAppConfig } from "../hooks/useAppConfig";
import toast from "react-hot-toast";
import { SearchX } from "lucide-react";

function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Shimmer className="h-52 w-full rounded-none" />
      <div className="p-3.5 space-y-2.5">
        <Shimmer className="h-3.5 w-28" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-3/4" />
        <div className="flex gap-2 pt-0.5">
          <Shimmer className="h-8 flex-1 rounded-xl" />
          <Shimmer className="h-8 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function DiscoverPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const appConfig   = useAppConfig();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["suggestions"],
    queryFn:  () => profilesService.getSuggestions().then((r) => r.data.profiles?.data ?? []),
    staleTime: 1000 * 60 * 5,
    enabled: appConfig.discover_enabled,
  });

  const connect = useMutation({
    mutationFn: (receiverId: number) =>
      api.post("/connections", { receiver_id: receiverId }),
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
    onError: () => toast.error("Could not send request. Try again."),
  });

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

  // Derive story strip profiles — those seen recently
  const rawProfiles = data ?? [];
  const onlineProfiles = rawProfiles
    .filter((p: any) => {
      const lastSeen = p.attributes.last_seen_at;
      return lastSeen && (Date.now() - new Date(lastSeen).getTime()) < 5 * 60 * 1000;
    })
    .slice(0, 12)
    .map((p: any) => ({
      id: Number(p.id),
      name: p.attributes.name ?? "User",
      avatar_url: p.attributes.avatar_url,
      intent: p.attributes.intent,
      online: true,
    }));

  if (isLoading) {
    return (
      <div className="relative max-w-5xl mx-auto px-4 py-6">
        <AuroraBg />
        <Shimmer className="h-5 w-36 mb-1" />
        <Shimmer className="h-3.5 w-64 mb-6 mt-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative flex flex-col items-center justify-center py-24 text-zinc-500">
        <AuroraBg />
        <p>Something went wrong. Please refresh.</p>
      </div>
    );
  }

  if (rawProfiles.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center py-24 text-center px-4">
        <AuroraBg />
        <p className="text-2xl font-bold text-white">No new matches today</p>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm">
          We'll surface more people matching your intent tomorrow.
        </p>
      </div>
    );
  }

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-6">
      <AuroraBg />

      {/* Online now strip */}
      {onlineProfiles.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mb-3">
            Online now · {onlineProfiles.length}
          </p>
          <StoryStrip
            profiles={onlineProfiles}
            onSelect={(id) => navigate(`/profile/${id}`)}
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-white">Today's matches</h1>
        <span className="text-xs text-zinc-600">{rawProfiles.length} found</span>
      </div>
      <p className="text-sm text-zinc-500 mb-5">
        Compatible intent, nearby. Refreshes daily.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rawProfiles.map((p: any) => (
          <UserCard
            key={p.id}
            profile={{ id: Number(p.id), ...p.attributes }}
            onView={() => navigate(`/profile/${p.id}`)}
            onConnect={() => connect.mutate(Number(p.id))}
            loading={connect.isPending}
          />
        ))}
      </div>
    </div>
  );
}
