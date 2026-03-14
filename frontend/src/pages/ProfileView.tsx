import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck, MapPin, Briefcase, Flag, Ban, Grid3X3, List, Ruler, Dumbbell, Wine, Cigarette, Heart, Globe2, BookOpen, MessageSquare } from "lucide-react";
import { useState } from "react";
import { profilesService } from "../services/profiles.service";
import { connectionsService } from "../services/connections.service";
import { api } from "../lib/api";
import { IntentBadge } from "../components/shared/IntentBadge";
import { ReportModal } from "../components/shared/ReportModal";
import { PostFeed } from "../components/shared/PostFeed";
import toast from "react-hot-toast";

export function ProfileViewPage() {
  const { id }            = useParams<{ id: string }>();
  const navigate          = useNavigate();
  const queryClient       = useQueryClient();
  const [showReport, setShowReport] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile", id],
    queryFn:  () => profilesService.getProfile(Number(id)).then((r) => r.data.profile.data),
    enabled:  !!id,
  });

  const connect = useMutation({
    mutationFn: () => connectionsService.create(Number(id)),
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.errors?.[0] ?? "Could not send request");
    },
  });

  const block = useMutation({
    mutationFn: () => api.post("/blocks", { blocked_id: Number(id) }),
    onSuccess: () => {
      toast.success("User blocked.");
      navigate(-1);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 animate-pulse space-y-4">
        <div className="h-64 bg-dark-card rounded-2xl border border-dark-border" />
        <div className="h-6 bg-dark-hover rounded w-40" />
        <div className="h-4 bg-dark-hover rounded w-24" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
        <p>Profile not found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Go back</button>
      </div>
    );
  }

  const p = data.attributes;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card overflow-hidden">
        {/* Avatar */}
        <div className="relative">
          <div className="h-56 bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center">
            {p.avatar_url ? (
              <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-muted border border-brand-border flex items-center justify-center text-4xl font-bold text-brand">
                {p.name?.[0]}
              </div>
            )}
          </div>
          {p.verified && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-dark-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-700/40">
              <ShieldCheck size={12} /> Verified
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{p.name}, {p.age}</h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-sm text-zinc-500">
                <MapPin size={13} /> {p.city}
              </div>
              {p.occupation && (
                <div className="flex items-center gap-1.5 mt-0.5 text-sm text-zinc-500">
                  <Briefcase size={13} /> {p.occupation}
                </div>
              )}
            </div>
            <IntentBadge intent={p.intent} />
          </div>

          {p.bio && (
            <p className="text-sm text-zinc-300 leading-relaxed">{p.bio}</p>
          )}

          {/* Interests */}
          {p.interests?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {p.interests.map((i: string) => (
                  <span key={i} className="text-xs bg-dark-hover text-zinc-400 border border-dark-border rounded-full px-2.5 py-1">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extended Details */}
          {(p.height_cm || p.body_type || p.cultural_background || p.religion || p.languages_spoken?.length > 0 || p.drinking || p.smoking || p.workout_frequency || p.relationship_status || p.appearance_tags?.length > 0) && (
            <div className="space-y-3 pt-1">
              {/* About section rows */}
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">About</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {p.height_cm && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Ruler size={13} className="text-zinc-500 flex-shrink-0" />
                    <span>{p.height_cm} cm</span>
                  </div>
                )}
                {p.body_type && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Dumbbell size={13} className="text-zinc-500 flex-shrink-0" />
                    <span className="capitalize">{p.body_type.replace(/_/g, " ")}</span>
                  </div>
                )}
                {p.cultural_background && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Globe2 size={13} className="text-zinc-500 flex-shrink-0" />
                    <span className="capitalize">{(p.cultural_background_custom || p.cultural_background).replace(/_/g, " ")}</span>
                  </div>
                )}
                {p.religion && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <BookOpen size={13} className="text-zinc-500 flex-shrink-0" />
                    <span className="capitalize">{p.religion.replace(/_/g, " ")}</span>
                  </div>
                )}
                {p.relationship_status && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Heart size={13} className="text-zinc-500 flex-shrink-0" />
                    <span className="capitalize">{p.relationship_status.replace(/_/g, " ")}</span>
                  </div>
                )}
                {p.drinking && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Wine size={13} className="text-zinc-500 flex-shrink-0" />
                    <span className="capitalize">Drinks: {p.drinking}</span>
                  </div>
                )}
                {p.smoking && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Cigarette size={13} className="text-zinc-500 flex-shrink-0" />
                    <span className="capitalize">Smokes: {p.smoking}</span>
                  </div>
                )}
                {p.workout_frequency && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Dumbbell size={13} className="text-zinc-500 flex-shrink-0" />
                    <span className="capitalize">Workout: {p.workout_frequency}</span>
                  </div>
                )}
              </div>

              {/* Languages */}
              {p.languages_spoken?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400 mb-1.5">
                    <MessageSquare size={13} className="text-zinc-500" />
                    <span>Speaks</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.languages_spoken.map((lang: string) => (
                      <span key={lang} className="text-xs bg-dark-hover text-zinc-400 border border-dark-border rounded-full px-2.5 py-1">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Appearance tags */}
              {p.appearance_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {p.appearance_tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-violet-900/20 text-violet-400 border border-violet-800/30 rounded-full px-2.5 py-1 capitalize">
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => connect.mutate()}
              disabled={connect.isPending}
              className="btn-primary flex-1"
            >
              {connect.isPending ? "Sending..." : "Send Connection Request"}
            </button>
          </div>

          {/* Safety actions */}
          <div className="flex gap-3 pt-1 border-t border-dark-border">
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-amber-400 transition-colors"
            >
              <Flag size={13} /> Report
            </button>
            <button
              onClick={() => block.mutate()}
              disabled={block.isPending}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              <Ban size={13} /> Block
            </button>
          </div>
        </div>
      </div>

      {/* Media Gallery */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Posts</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "text-brand bg-brand-muted" : "text-zinc-500 hover:text-white"}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "text-brand bg-brand-muted" : "text-zinc-500 hover:text-white"}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
        <PostFeed userId={Number(id)} showCreateBox={false} gridView={viewMode === "grid"} />
      </div>

      {showReport && (
        <ReportModal
          reportedUserId={Number(id)}
          reportedName={p.name}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
