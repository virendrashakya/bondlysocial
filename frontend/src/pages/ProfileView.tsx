import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck, MapPin, Briefcase, Flag, Ban, Ruler, Dumbbell, Wine, Cigarette, Heart, Globe2, BookOpen, MessageSquare, Images } from "lucide-react";
import { useState } from "react";
import { profilesService } from "@/services/profiles.service";
import { connectionsService } from "@/services/connections.service";
import { api } from "@/lib/api";
import { IntentBadge } from "@/components/shared/IntentBadge";
import { ReportModal } from "@/components/shared/ReportModal";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";

export function ProfileViewPage() {
  const { id }            = useParams<{ id: string }>();
  const navigate          = useNavigate();
  const queryClient       = useQueryClient();
  const [showReport, setShowReport] = useState(false);

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
    onError: (err: Error & { response?: { data?: { errors?: string[] } } }) => {
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
        <Button variant="secondary" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const p = data.attributes;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4 text-zinc-500 hover:text-white"
      >
        <ArrowLeft size={16} /> Back
      </Button>

      <GlassCard padding="none" className="overflow-hidden">
        {/* Avatar */}
        <div className="relative">
          <div className="h-56 bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center">
            {p.avatar_url ? (
              <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <Avatar className="w-24 h-24 text-4xl">
                <AvatarFallback>{p.name?.[0]}</AvatarFallback>
              </Avatar>
            )}
          </div>
          {p.verified && (
            <Badge variant="success" className="absolute top-3 right-3 bg-dark-card/90 backdrop-blur-sm">
              <ShieldCheck size={12} /> Verified
            </Badge>
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
                  <Badge key={i} variant="default" size="default">
                    {i}
                  </Badge>
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
                      <Badge key={lang} variant="info" size="default">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Appearance tags */}
              {p.appearance_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {p.appearance_tags.map((tag: string) => (
                    <Badge key={tag} variant="violet" size="default" className="capitalize">
                      {tag.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => connect.mutate()}
              disabled={connect.isPending}
              className="flex-1"
            >
              {connect.isPending ? "Sending..." : "Send Connection Request"}
            </Button>
          </div>

          {/* Safety actions */}
          <Separator />
          <div className="flex gap-3 pt-1">
            <Button
              variant="glass"
              size="xs"
              onClick={() => setShowReport(true)}
              className="text-zinc-500 hover:text-amber-400"
            >
              <Flag size={13} /> Report
            </Button>
            <Button
              variant="destructive"
              size="xs"
              onClick={() => block.mutate()}
              disabled={block.isPending}
            >
              <Ban size={13} /> Block
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* View Posts button */}
      <div className="mt-4">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => navigate(`/profile/${id}/posts`)}
        >
          <Images size={16} /> View Posts
        </Button>
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
