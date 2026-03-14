import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, ImageIcon, Smile, Heart, Play } from "lucide-react";
import { messagesService } from "../../services/messages.service";
import { useConversationChannel } from "../../hooks/useActionCable";
import { useAuthStore } from "../../store/authStore";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

interface ChatWindowProps {
  connectionId: number;
  otherUserName: string;
  otherUser?: any;
}

interface ReferencedPost {
  id: number;
  caption?: string;
  author_name: string;
  author_id: number;
  media_url?: string;
  media_type?: "image" | "video";
  media_count: number;
}

const QUICK_REACTIONS = ["👋", "❤️", "😂", "🔥", "👏", "🙏"];

function MessageDateDivider({ date }: { date: string }) {
  const d = new Date(date);
  const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMM d, yyyy");
  return (
    <div className="flex items-center gap-3 my-3" role="separator" aria-label={label}>
      <div className="flex-1 h-px bg-dark-border" />
      <span className="text-[10px] text-zinc-600 font-medium">{label}</span>
      <div className="flex-1 h-px bg-dark-border" />
    </div>
  );
}

// --- Shared Post Card (embedded in message bubble) ---
function SharedPostCard({ post, isOwn }: { post: ReferencedPost; isOwn: boolean }) {
  return (
    <div
      className={`rounded-xl overflow-hidden mb-1.5 border ${
        isOwn ? "border-white/10" : "border-dark-border"
      }`}
    >
      {/* Post media thumbnail */}
      {post.media_url && (
        <div className="relative">
          {post.media_type === "video" ? (
            <div className="relative">
              <video src={post.media_url} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center">
                  <Play size={16} fill="white" className="text-white ml-0.5" />
                </div>
              </div>
            </div>
          ) : (
            <img src={post.media_url} alt="" className="w-full h-32 object-cover" loading="lazy" />
          )}
          {post.media_count > 1 && (
            <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
              1/{post.media_count}
            </div>
          )}
        </div>
      )}

      {/* Post info */}
      <div className={`px-3 py-2 ${isOwn ? "bg-white/5" : "bg-dark-hover"}`}>
        <p className={`text-[10px] font-medium ${isOwn ? "text-white/70" : "text-zinc-500"}`}>
          {post.author_name}'s post
        </p>
        {post.caption && (
          <p className={`text-xs mt-0.5 line-clamp-2 ${isOwn ? "text-white/80" : "text-zinc-400"}`}>
            {post.caption}
          </p>
        )}
      </div>
    </div>
  );
}

export function ChatWindow({ connectionId, otherUserName, otherUser }: ChatWindowProps) {
  const [body, setBody]           = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const queryClient  = useQueryClient();
  const currentUser  = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ["messages", connectionId],
    queryFn:  () => messagesService.getMessages(connectionId).then((r) => r.data.messages),
  });

  const send = useMutation({
    mutationFn: (text: string) => messagesService.sendMessage(connectionId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", connectionId] });
      setBody("");
      inputRef.current?.focus();
    },
  });

  useConversationChannel(connectionId, () => {
    queryClient.invalidateQueries({ queryKey: ["messages", connectionId] });
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    send.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const messages = data?.data ?? [];

  // Group messages by date
  let lastDateStr = "";

  return (
    <div className="flex flex-col h-full bg-dark-bg" aria-label={`Chat with ${otherUserName}`}>
      {/* Desktop header */}
      <div className="hidden md:flex items-center gap-3 px-5 py-3.5 border-b border-dark-border bg-dark-surface">
        <div className="w-9 h-9 rounded-full bg-brand-muted border border-brand-border overflow-hidden flex-shrink-0 flex items-center justify-center text-brand font-semibold">
          {otherUser?.avatar_url ? (
            <img src={otherUser.avatar_url} alt={otherUserName} className="w-full h-full object-cover" />
          ) : (
            <span>{otherUserName[0]}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{otherUserName}</p>
          <p className="text-[11px] text-zinc-500">
            {otherUser?.intent?.replace(/_/g, " ") ?? "Connected"}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        role="log"
        aria-live="polite"
        aria-label="Message history"
      >
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-muted border border-brand-border flex items-center justify-center mb-4">
              <i className="fa-regular fa-comments text-2xl text-brand" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-white">Start the conversation</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs">
              You and {otherUserName} are now connected. Say hello!
            </p>
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => send.mutate(emoji)}
                  className="text-xl hover:scale-125 transition-transform"
                  aria-label={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg: any, i: number) => {
          const attrs = msg.attributes;
          const isOwn = attrs.sender_id === currentUser?.id;
          const msgDate = attrs.created_at?.slice(0, 10);
          const showDivider = msgDate !== lastDateStr;
          if (showDivider) lastDateStr = msgDate;

          const next = messages[i + 1];
          const isLastInGroup = !next || next.attributes.sender_id !== attrs.sender_id;

          const referencedPost: ReferencedPost | null = attrs.referenced_post || null;
          const messageType: string = attrs.message_type || "text";

          return (
            <div key={msg.id}>
              {showDivider && <MessageDateDivider date={attrs.created_at} />}
              <div className={`flex ${isOwn ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-3" : "mb-0.5"}`}>
                {/* Other user avatar for last in group */}
                {!isOwn && isLastInGroup && (
                  <div className="w-7 h-7 rounded-full bg-brand-muted border border-brand-border overflow-hidden flex-shrink-0 mr-2 mt-auto flex items-center justify-center text-brand text-xs font-semibold">
                    {otherUser?.avatar_url ? (
                      <img src={otherUser.avatar_url} alt={otherUserName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{otherUserName[0]}</span>
                    )}
                  </div>
                )}
                {!isOwn && !isLastInGroup && <div className="w-7 mr-2" />}

                <div
                  className={`max-w-[72%] sm:max-w-sm text-sm leading-relaxed ${
                    referencedPost
                      ? `${isOwn ? "bg-brand text-white rounded-2xl rounded-br-sm" : "bg-dark-surface text-white border border-dark-border rounded-2xl rounded-bl-sm"} overflow-hidden`
                      : `px-3.5 py-2 ${isOwn ? "bg-brand text-white rounded-2xl rounded-br-sm" : "bg-dark-surface text-white border border-dark-border rounded-2xl rounded-bl-sm"}`
                  }`}
                >
                  {/* Referenced post card */}
                  {referencedPost && (
                    <div className="p-1.5 pb-0">
                      <SharedPostCard post={referencedPost} isOwn={isOwn} />
                    </div>
                  )}

                  {/* Message body */}
                  {attrs.body && (
                    <p className={referencedPost ? "px-3.5 py-1" : ""}>{attrs.body}</p>
                  )}

                  {/* Shared post label if no body */}
                  {!attrs.body && referencedPost && (
                    <p className={`px-3.5 py-1 text-xs ${isOwn ? "text-pink-200/70" : "text-zinc-500"}`}>
                      <Heart size={10} className="inline mr-1" />Shared a post
                    </p>
                  )}

                  {/* Timestamp */}
                  <p className={`text-[10px] mt-0.5 text-right ${referencedPost ? "px-3.5 pb-2" : ""} ${isOwn ? "text-pink-200/70" : "text-zinc-600"}`}>
                    {formatDistanceToNow(new Date(attrs.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick reactions emoji strip */}
      {showEmoji && (
        <div className="flex gap-3 px-4 py-2 border-t border-dark-border bg-dark-surface">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => { send.mutate(emoji); setShowEmoji(false); }}
              className="text-xl hover:scale-125 transition-transform"
              aria-label={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="px-3 py-3 border-t border-dark-border bg-dark-surface flex items-center gap-2"
        aria-label="Send a message"
      >
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          aria-label="Quick reactions"
          aria-expanded={showEmoji}
          className="p-2 text-zinc-500 hover:text-brand transition-colors rounded-xl"
        >
          <Smile size={18} />
        </button>

        <button
          type="button"
          aria-label="Attach image (coming soon)"
          disabled
          className="p-2 text-zinc-700 rounded-xl cursor-not-allowed"
        >
          <ImageIcon size={18} />
        </button>

        <input
          ref={inputRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${otherUserName}...`}
          className="flex-1 rounded-xl border border-dark-border bg-dark-input px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-brand transition-colors"
          maxLength={2000}
          aria-label="Message input"
          autoComplete="off"
        />

        <button
          type="submit"
          disabled={!body.trim() || send.isPending}
          aria-label="Send message"
          className="w-9 h-9 flex items-center justify-center bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-40 transition-all active:scale-95"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
