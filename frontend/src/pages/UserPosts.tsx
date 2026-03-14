import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Grid3X3, List } from "lucide-react";
import { useState } from "react";
import { profilesService } from "@/services/profiles.service";
import { PostFeed } from "@/components/shared/PostFeed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserPostsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => profilesService.getProfile(Number(id)).then((r) => r.data.profile.data),
    enabled: !!id,
  });

  const name = data?.attributes?.name ?? "User";

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-zinc-500 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-lg font-bold text-white">{name}'s Posts</h1>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className={cn(
              "h-8 w-8",
              viewMode === "grid" ? "text-brand bg-brand-muted" : "text-zinc-500 hover:text-white"
            )}
          >
            <Grid3X3 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={cn(
              "h-8 w-8",
              viewMode === "list" ? "text-brand bg-brand-muted" : "text-zinc-500 hover:text-white"
            )}
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      <PostFeed userId={Number(id)} showCreateBox={false} gridView={viewMode === "grid"} />
    </div>
  );
}
