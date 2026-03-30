import { useState } from "react";
import { Grid3X3, List } from "lucide-react";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { PostFeed } from "@/components/shared/PostFeed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FeedPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  return (
    <div className="relative max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <AuroraBg />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <i className="fa-solid fa-fire text-brand text-base" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gradient">Moments</h1>
          </div>
          <p className="text-sm text-zinc-500">Share moments, milestones, and thoughts</p>
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

      <PostFeed showCreateBox={viewMode === "list"} gridView={viewMode === "grid"} />
    </div>
  );
}
