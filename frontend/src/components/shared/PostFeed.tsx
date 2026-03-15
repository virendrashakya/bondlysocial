import { useState, useRef, useCallback, DragEvent } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal, ImageIcon, Video, X, ChevronLeft, ChevronRight, Lock, Globe, MapPin, Plus, ArrowLeft, Upload, Camera, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { usePosts, useLikePost, useDeletePost, useCreatePost, useConnections } from "@/hooks/queries";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { Post, MediaItem, JsonApiResource, ConnectionAttributes } from "@/types";

// --- Instagram-style Carousel ---
function MediaCarousel({ media }: { media: MediaItem[] }) {
  const [current, setCurrent] = useState(0);

  if (media.length === 0) return null;
  if (media.length === 1) {
    const item = media[0];
    return (
      <div className="border-t border-white/[0.06]">
        {item.type === "video" ? (
          <video src={item.url} controls className="w-full max-h-[28rem] object-cover" aria-label="Post video" />
        ) : (
          <img src={item.url} alt="Post" className="w-full max-h-[28rem] object-cover" loading="lazy" />
        )}
      </div>
    );
  }

  const item = media[current];

  return (
    <div className="border-t border-white/[0.06] relative group">
      {item.type === "video" ? (
        <video src={item.url} controls className="w-full max-h-[28rem] object-cover" aria-label="Post video" />
      ) : (
        <img src={item.url} alt={`Slide ${current + 1}`} className="w-full max-h-[28rem] object-cover" loading="lazy" />
      )}

      {/* Nav arrows */}
      {current > 0 && (
        <button
          onClick={() => setCurrent((c) => c - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      {current < media.length - 1 && (
        <button
          onClick={() => setCurrent((c) => c + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {media.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              i === current ? "bg-white w-3" : "bg-white/40"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Counter badge */}
      <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
        {current + 1}/{media.length}
      </div>
    </div>
  );
}

// --- Create Post Trigger Button ---
function CreatePostTrigger({ onClick }: { onClick: () => void }) {
  const user = useAuthStore((s) => s.user);
  return (
    <GlassCard
      variant="interactive"
      padding="sm"
      className="mb-4 w-full flex items-center gap-3 group"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <Avatar className="h-9 w-9 text-sm">
        <AvatarFallback>
          {user?.profile?.name?.[0]?.toUpperCase() ?? user?.email[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors flex-1 text-left">
        Share a moment, milestone, or thought…
      </span>
      <div className="flex gap-2 text-zinc-600">
        <ImageIcon size={18} />
        <Camera size={18} />
      </div>
    </GlassCard>
  );
}

// --- Instagram-style Create Post Modal (multi-step) ---
type CreateStep = "select" | "arrange" | "details";

function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<CreateStep>("select");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: "image" | "video" }[]>([]);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<"public" | "connections">("public");
  const [location, setLocation] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = useCreatePost(() => onClose());

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (valid.length === 0) { toast.error("Only images and videos are supported."); return; }
    const combined = [...files, ...valid].slice(0, 10);
    setFiles(combined);
    setPreviews(combined.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith("video/") ? "video" as const : "image" as const,
    })));
    if (files.length === 0) setStep("arrange");
  }, [files]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    if (newFiles.length === 0) setStep("select");
    else if (activePreview >= newFiles.length) setActivePreview(newFiles.length - 1);
  };

  const moveFile = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    const newFiles = [...files];
    const newPreviews = [...previews];
    [newFiles[from], newFiles[to]] = [newFiles[to], newFiles[from]];
    [newPreviews[from], newPreviews[to]] = [newPreviews[to], newPreviews[from]];
    setFiles(newFiles);
    setPreviews(newPreviews);
    setActivePreview(to);
  };

  const stepTitle = step === "select" ? "Create new post" : step === "arrange" ? "Arrange" : "New post";
  const canGoBack = step === "arrange" || step === "details";
  const canGoNext = step === "arrange" && files.length > 0;

  const handleBack = () => {
    if (step === "details") setStep("arrange");
    else if (step === "arrange") { setStep("select"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <GlassCard
        variant="elevated"
        padding="none"
        className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-page-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] flex-shrink-0">
          {canGoBack ? (
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8" aria-label="Back">
              <ArrowLeft size={20} />
            </Button>
          ) : (
            <div className="w-8" />
          )}
          <h2 className="text-sm font-semibold text-white">{stepTitle}</h2>
          {canGoNext ? (
            <Button variant="ghost" onClick={() => setStep("details")} className="text-sm font-semibold text-brand hover:text-brand-hover">
              Next
            </Button>
          ) : step === "details" ? (
            <Button
              variant="ghost"
              onClick={() => submit.mutate({ caption, visibility, location, files })}
              disabled={submit.isPending || (files.length === 0 && !caption.trim())}
              className="text-sm font-semibold text-brand hover:text-brand-hover disabled:opacity-40"
            >
              {submit.isPending ? "Sharing…" : "Share"}
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-white">
              <X size={20} />
            </Button>
          )}
        </div>

        {/* Step 1: Select media */}
        {step === "select" && (
          <div
            className={cn(
              "flex-1 flex flex-col items-center justify-center p-8 min-h-[400px] transition-colors",
              dragOver && "bg-brand/5 border-2 border-dashed border-brand"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="w-20 h-20 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center mb-5">
              <Upload size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Drag photos and videos here</h3>
            <p className="text-sm text-zinc-500 mb-6">Up to 10 files per post</p>
            <Button onClick={() => fileRef.current?.click()}>
              Select from device
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        )}

        {/* Step 2: Arrange media */}
        {step === "arrange" && (
          <div className="flex-1 flex flex-col min-h-[400px]">
            {/* Main preview */}
            <div className="flex-1 relative bg-black flex items-center justify-center min-h-[300px]">
              {previews[activePreview] && (
                previews[activePreview].type === "video" ? (
                  <video
                    src={previews[activePreview].url}
                    controls
                    className="max-w-full max-h-[350px] object-contain"
                  />
                ) : (
                  <img
                    src={previews[activePreview].url}
                    alt={`Preview ${activePreview + 1}`}
                    className="max-w-full max-h-[350px] object-contain"
                  />
                )
              )}
              {/* Navigation arrows on preview */}
              {activePreview > 0 && (
                <button
                  onClick={() => setActivePreview((c) => c - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              {activePreview < previews.length - 1 && (
                <button
                  onClick={() => setActivePreview((c) => c + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight size={16} />
                </button>
              )}
              {previews.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {activePreview + 1}/{previews.length}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="px-3 py-3 border-t border-white/[0.08] bg-white/[0.02] flex gap-2 items-center overflow-x-auto flex-shrink-0">
              {previews.map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors",
                    i === activePreview ? "border-brand" : "border-transparent hover:border-zinc-600"
                  )}
                  onClick={() => setActivePreview(i)}
                >
                  {p.type === "video" ? (
                    <video src={p.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  )}
                  {p.type === "video" && (
                    <div className="absolute bottom-0.5 left-0.5 bg-black/70 text-white text-[8px] px-1 py-px rounded">
                      <Video size={8} className="inline mr-0.5" />
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                    aria-label={`Remove file ${i + 1}`}
                  >
                    <X size={8} />
                  </button>
                  {/* Reorder arrows */}
                  {i === activePreview && previews.length > 1 && (
                    <div className="absolute bottom-0 inset-x-0 flex justify-center gap-1 pb-0.5">
                      {i > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveFile(i, i - 1); }}
                          className="w-4 h-4 bg-black/80 rounded-full flex items-center justify-center text-white"
                          aria-label="Move left"
                        >
                          <ChevronLeft size={8} />
                        </button>
                      )}
                      {i < previews.length - 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveFile(i, i + 1); }}
                          className="w-4 h-4 bg-black/80 rounded-full flex items-center justify-center text-white"
                          aria-label="Move right"
                        >
                          <ChevronRight size={8} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add more button */}
              {files.length < 10 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-white/[0.08] hover:border-brand flex items-center justify-center text-zinc-500 hover:text-brand transition-colors"
                  aria-label="Add more media"
                >
                  <Plus size={20} />
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>
        )}

        {/* Step 3: Details (caption, location, visibility) */}
        {step === "details" && (
          <div className="flex-1 flex flex-col sm:flex-row min-h-[400px]">
            {/* Preview side */}
            <div className="sm:w-1/2 bg-black flex items-center justify-center border-b sm:border-b-0 sm:border-r border-white/[0.08] relative">
              {previews[activePreview] && (
                previews[activePreview].type === "video" ? (
                  <video src={previews[activePreview].url} controls className="max-w-full max-h-[300px] sm:max-h-full object-contain" />
                ) : (
                  <img src={previews[activePreview].url} alt="" className="max-w-full max-h-[300px] sm:max-h-full object-contain" />
                )
              )}
              {previews.length > 1 && (
                <>
                  {activePreview > 0 && (
                    <button
                      onClick={() => setActivePreview((c) => c - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white"
                      aria-label="Previous"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  )}
                  {activePreview < previews.length - 1 && (
                    <button
                      onClick={() => setActivePreview((c) => c + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white"
                      aria-label="Next"
                    >
                      <ChevronRight size={14} />
                    </button>
                  )}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {previews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePreview(i)}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all",
                          i === activePreview ? "bg-white w-3" : "bg-white/40"
                        )}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Details side */}
            <div className="sm:w-1/2 flex flex-col">
              {/* Caption */}
              <div className="flex-1 p-4">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows={6}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-600 outline-none resize-none leading-relaxed"
                  maxLength={500}
                  autoFocus
                />
                <div className="text-right">
                  <span className={cn("text-[10px]", caption.length > 450 ? "text-amber-400" : "text-zinc-600")}>
                    {caption.length}/500
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="px-4 py-3 border-t border-white/[0.08] flex items-center gap-2">
                <MapPin size={16} className="text-zinc-500 flex-shrink-0" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none flex-1"
                  maxLength={100}
                />
              </div>

              {/* Visibility */}
              <div className="px-4 py-3 border-t border-white/[0.08]">
                <p className="text-xs text-zinc-500 mb-2">Audience</p>
                <div className="flex gap-2">
                  <Button
                    variant={visibility === "public" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVisibility("public")}
                    className="gap-1.5"
                  >
                    <Globe size={13} /> Everyone
                  </Button>
                  <Button
                    variant={visibility === "connections" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVisibility("connections")}
                    className={cn("gap-1.5", visibility === "connections" && "bg-amber-600 hover:bg-amber-700 shadow-amber-900/20")}
                  >
                    <Lock size={13} /> Connections only
                  </Button>
                </div>
              </div>

              {/* File count */}
              <div className="px-4 py-3 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {files.length} {files.length === 1 ? "file" : "files"} selected
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setStep("arrange")}
                  className="text-brand hover:text-brand-hover"
                >
                  Edit media
                </Button>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// --- Post Card ---
function PostCard({ post, onLike, onShare, onDelete, isOwner }: { post: Post; onLike: (id: number) => void; onShare?: (post: Post) => void; onDelete?: (id: number) => void; isOwner: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const media: MediaItem[] = post.media?.length > 0 ? post.media : (
    post.media_url ? [{ url: post.media_url, type: post.media_type || "image", id: 0 }] : []
  );

  return (
    <GlassCard padding="none" className="overflow-hidden animate-page-enter">
      <article aria-label={`Post by ${post.author_name}`}>
        {/* Author header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 text-sm">
              {post.author_avatar && <AvatarImage src={post.author_avatar} alt={post.author_name} />}
              <AvatarFallback>{post.author_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-white">{post.author_name}</p>
                {post.visibility === "connections" && (
                  <Lock size={10} className="text-amber-400" aria-label="Connections only" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                {post.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><MapPin size={8} />{post.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* More options with dropdown */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-600 hover:text-white"
              aria-label="More options"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreHorizontal size={16} />
            </Button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => { setMenuOpen(false); setConfirmDelete(false); }} />
                <div className="absolute right-0 top-full mt-1 z-50 w-44 py-1 rounded-xl border border-white/[0.08] bg-zinc-900/95 backdrop-blur-md shadow-xl">
                  {isOwner && !confirmDelete && (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-white/[0.06] transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete post
                    </button>
                  )}
                  {isOwner && confirmDelete && (
                    <button
                      onClick={() => { onDelete?.(post.id); setMenuOpen(false); setConfirmDelete(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 font-semibold hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                      Confirm delete
                    </button>
                  )}
                  {!isOwner && (
                    <p className="px-3 py-2.5 text-sm text-zinc-500">No actions available</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="px-4 pb-2 text-sm text-zinc-300 leading-relaxed">{post.caption}</p>
        )}

        {/* Media carousel */}
        <MediaCarousel media={media} />

        {/* Reactions */}
        <div className="flex items-center gap-1 px-4 py-3 border-t border-white/[0.06]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            aria-label={post.liked_by_me ? `Unlike post` : `Like post`}
            aria-pressed={post.liked_by_me}
            className={cn(
              "gap-1.5 rounded-xl",
              post.liked_by_me
                ? "text-rose-400 bg-rose-900/30 border border-rose-800/30 hover:bg-rose-900/40"
                : "text-zinc-500 hover:text-rose-400 hover:bg-rose-900/20"
            )}
          >
            <Heart size={14} fill={post.liked_by_me ? "currentColor" : "none"} aria-hidden="true" />
            {post.likes_count}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label={`${post.comments_count} comments`}
            className="gap-1.5 rounded-xl text-zinc-500 hover:text-brand hover:bg-brand-muted"
          >
            <MessageCircle size={14} aria-hidden="true" />
            {post.comments_count}
          </Button>

          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(post)}
              aria-label="Share post in message"
              className="gap-1.5 rounded-xl text-zinc-500 hover:text-white ml-auto"
            >
              <Send size={14} aria-hidden="true" />
              Share
            </Button>
          )}
        </div>
      </article>
    </GlassCard>
  );
}

// --- Share Modal (pick connection to send post to) ---
function SharePostModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState<number | null>(null);

  const { data: connections } = useConnections();

  const handleShare = async (connectionId: number) => {
    setSending(connectionId);
    try {
      await api.post("/messages", { connection_id: connectionId, referenced_post_id: post.id });
      toast.success("Post shared!");
      onClose();
    } catch {
      toast.error("Failed to share.");
    } finally {
      setSending(null);
    }
  };

  const conns = (connections ?? []).filter((c: JsonApiResource<ConnectionAttributes>) => {
    const name = c.attributes?.other_user?.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <GlassCard
        variant="elevated"
        padding="none"
        className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white text-center">Share Post</h3>
        </div>

        <div className="px-4 py-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search connections..."
          />
        </div>

        {/* Post preview */}
        <div className="mx-4 mb-2 p-2.5 bg-white/[0.04] rounded-lg border border-white/[0.08] flex gap-2.5">
          {(post.media?.[0]?.url || post.media_url) && (
            <img src={post.media?.[0]?.url || post.media_url} alt="" className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{post.author_name}</p>
            <p className="text-[11px] text-zinc-500 line-clamp-2">{post.caption || "Media post"}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-1">
          {conns.length === 0 && (
            <p className="text-center text-sm text-zinc-600 py-6">No connections found</p>
          )}
          {conns.map((conn: JsonApiResource<ConnectionAttributes>) => {
            const other = conn.attributes?.other_user;
            const connId = Number(conn.id);
            return (
              <button
                key={connId}
                onClick={() => handleShare(connId)}
                disabled={sending === connId}
                className="w-full flex items-center gap-3 py-2.5 px-1 hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                <Avatar className="h-9 w-9 text-sm">
                  {other?.avatar_url && <AvatarImage src={other.avatar_url} alt={other.name} />}
                  <AvatarFallback>{other?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-white flex-1 text-left">{other?.name}</span>
                <span className="text-xs text-brand font-medium">
                  {sending === connId ? "Sending..." : "Send"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-white/[0.08]">
          <Button variant="ghost" className="w-full text-zinc-400 hover:text-white" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

// --- Post Detail Modal (opens from grid tap) ---
function PostDetailModal({ post, onClose, onLike, onDelete, onShare }: {
  post: Post;
  onClose: () => void;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onShare: (post: Post) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end px-4 pt-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-white">
            <X size={20} />
          </Button>
        </div>
        <PostCard
          post={post}
          onLike={onLike}
          onShare={onShare}
          onDelete={onDelete}
          isOwner={post.is_own}
        />
      </div>
    </div>
  );
}

// --- Post Feed ---
interface PostFeedProps {
  userId?: number;
  showCreateBox?: boolean;
  gridView?: boolean;
}

export function PostFeed({ userId, showCreateBox = true, gridView = false }: PostFeedProps) {
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data, isLoading } = usePosts(userId);
  const like = useLikePost();
  const deletePost = useDeletePost();

  const posts: Post[] = data ?? [];

  if (isLoading) {
    return (
      <div className={gridView ? "grid grid-cols-3 gap-0.5" : "space-y-4"}>
        {[1, 2, 3, 4, 5, 6].map((i) =>
          gridView ? (
            <div key={i} className="aspect-square bg-white/[0.04] animate-pulse" />
          ) : (
            <GlassCard key={i} padding="sm" className="space-y-3 animate-pulse">
              <div className="flex gap-2">
                <div className="w-9 h-9 rounded-full bg-white/[0.06]" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-white/[0.06] rounded w-24" />
                  <div className="h-2.5 bg-white/[0.06] rounded w-16" />
                </div>
              </div>
              <div className="h-40 bg-white/[0.06] rounded-xl" />
            </GlassCard>
          )
        )}
      </div>
    );
  }

  // Instagram-style grid view (for profile gallery)
  if (gridView) {
    return (
      <>
        <div className="grid grid-cols-3 gap-0.5 rounded-lg overflow-hidden" aria-label="Media gallery">
          {posts.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon size={32} className="text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-500">No posts yet</p>
            </div>
          )}
          {posts.map((post) => {
            const thumb = post.media?.[0] || (post.media_url ? { url: post.media_url, type: post.media_type } : null);
            return (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="aspect-square relative group overflow-hidden bg-white/[0.04]"
                aria-label={`Post: ${post.caption?.slice(0, 40) || "Media"}`}
              >
                {thumb ? (
                  thumb.type === "video" ? (
                    <video src={thumb.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={thumb.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <MessageCircle size={24} />
                  </div>
                )}

                {/* Hover / tap overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <span className="flex items-center gap-1 text-white text-sm font-semibold">
                    <Heart size={16} fill="white" /> {post.likes_count}
                  </span>
                  <span className="flex items-center gap-1 text-white text-sm font-semibold">
                    <MessageCircle size={16} fill="white" /> {post.comments_count}
                  </span>
                </div>

                {/* Multi-media indicator */}
                {(post.media_count > 1) && (
                  <div className="absolute top-1.5 right-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="13" height="13" rx="2" /><path d="M8 21h10a2 2 0 0 0 2-2V8" /></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Post detail modal from grid tap */}
        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onLike={(id) => like.mutate(id)}
            onDelete={(id) => { deletePost.mutate(id); setSelectedPost(null); }}
            onShare={(p) => { setSelectedPost(null); setSharePost(p); }}
          />
        )}
        {sharePost && <SharePostModal post={sharePost} onClose={() => setSharePost(null)} />}
      </>
    );
  }

  return (
    <div className="space-y-4" aria-label="Post feed">
      {showCreateBox && <CreatePostTrigger onClick={() => setShowCreateModal(true)} />}
      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}

      {posts.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon size={32} className="text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-500">No posts yet. Share your first moment!</p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={(id) => like.mutate(id)}
          onShare={(p) => setSharePost(p)}
          onDelete={(id) => deletePost.mutate(id)}
          isOwner={post.is_own}
        />
      ))}

      {sharePost && <SharePostModal post={sharePost} onClose={() => setSharePost(null)} />}
    </div>
  );
}
