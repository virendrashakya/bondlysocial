import { AuroraBg } from "../components/ui/AuroraBg";
import { PostFeed } from "../components/shared/PostFeed";

export function FeedPage() {
  return (
    <div className="relative max-w-2xl mx-auto px-4 py-6">
      <AuroraBg />

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <i className="fa-solid fa-fire text-brand text-base" aria-hidden="true" />
          <h1 className="text-xl font-bold text-white">Moments</h1>
        </div>
        <p className="text-sm text-zinc-500">Share moments, milestones, and thoughts</p>
      </div>

      <PostFeed showCreateBox />
    </div>
  );
}
