import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Smile, Heart, Play, Info, ImageIcon, X, Pin, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GifPicker } from "./GifPicker";
import { useMessages, useSendMessage, useSendImage, useReactToMessage, usePinMessage } from "@/hooks/queries";
import { useConversationChannel } from "@/hooks/useActionCable";
import { useAuthStore } from "@/store/authStore";
import { usePresenceStore } from "@/store/presenceStore";
import { queryKeys } from "@/lib/queryKeys";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { OtherUser, ReferencedPost, MessageReaction, JsonApiResource, MessageAttributes } from "@/types";

interface ChatWindowProps {
  connectionId: number;
  otherUserName: string;
  otherUser?: OtherUser;
  onInfoClick?: () => void;
}

function isGifUrl(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return /^https?:\/\/.+\.(gif|webp)(\?.*)?$/i.test(trimmed) ||
    trimmed.includes("tenor.com/") ||
    trimmed.includes("media.tenor.com/") ||
    trimmed.includes("giphy.com/");
}

const QUICK_REACTIONS = ["\u{1F44B}", "\u{2764}\u{FE0F}", "\u{1F602}", "\u{1F525}", "\u{1F44F}", "\u{1F64F}"];
const REACTION_EMOJIS = ["\u{2764}\u{FE0F}", "\u{1F602}", "\u{1F62E}", "\u{1F622}", "\u{1F621}", "\u{1F44D}", "\u{1F44E}", "\u{1F525}", "\u{1F389}", "\u{1F4AF}"];

function MessageDateDivider({ date }: { date: string }) {
  const d = new Date(date);
  const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMM d, yyyy");
  return (
    <div className="flex items-center gap-3 my-3" role="separator" aria-label={label}>
      <div className="flex-1 h-px bg-white/[0.06]" />
      <span className="text-[10px] text-zinc-600 font-medium">{label}</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

// --- Typing Indicator ---
function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 animate-fade-in">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-[10px] text-zinc-500">{name} is typing...</span>
    </div>
  );
}

// --- Reactions display under a message ---
function ReactionsDisplay({
  reactions,
  currentUserId,
  onToggle,
}: {
  reactions: MessageReaction[];
  currentUserId: number;
  onToggle: (emoji: string) => void;
}) {
  if (!reactions || reactions.length === 0) return null;

  // Group by emoji
  const grouped = reactions.reduce<Record<string, { count: number; hasOwn: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasOwn: false };
    acc[r.emoji].count++;
    if (r.user_id === currentUserId) acc[r.emoji].hasOwn = true;
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(grouped).map(([emoji, { count, hasOwn }]) => (
        <button
          key={emoji}
          onClick={() => onToggle(emoji)}
          className={cn(
            "inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border transition-all",
            hasOwn
              ? "bg-brand/20 border-brand/40 text-white"
              : "bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:bg-white/[0.08]"
          )}
        >
          <span>{emoji}</span>
          {count > 1 && <span className="text-[10px]">{count}</span>}
        </button>
      ))}
    </div>
  );
}

// --- Shared Post Card (embedded in message bubble) ---
function SharedPostCard({ post, isOwn }: { post: ReferencedPost; isOwn: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden mb-1.5 border",
        isOwn ? "border-white/10" : "border-white/[0.08]"
      )}
    >
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
      <div className={cn("px-3 py-2", isOwn ? "bg-white/5" : "bg-white/[0.04]")}>
        <p className={cn("text-[10px] font-medium", isOwn ? "text-white/70" : "text-zinc-500")}>
          {post.author_name}'s post
        </p>
        {post.caption && (
          <p className={cn("text-xs mt-0.5 line-clamp-2", isOwn ? "text-white/80" : "text-zinc-400")}>
            {post.caption}
          </p>
        )}
      </div>
    </div>
  );
}

export function ChatWindow({ connectionId, otherUserName, otherUser, onInfoClick }: ChatWindowProps) {
  const navigate = useNavigate();
  const [body, setBody]           = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif]     = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping]   = useState(false);
  const [reactionMsgId, setReactionMsgId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastTypingSentRef = useRef<number>(0);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient  = useQueryClient();
  const currentUser  = useAuthStore((s) => s.user);
  const isOtherOnline = usePresenceStore((s) => otherUser?.id ? s.isOnline(otherUser.id) : false);

  const { data: messages = [], isLoading } = useMessages(connectionId);

  const send = useSendMessage(connectionId);
  const sendImageMutation = useSendImage(connectionId);
  const reactToMessage = useReactToMessage(connectionId);
  const pinMessage = usePinMessage(connectionId);

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ActionCable with typing + read receipt handling
  const { sendTyping } = useConversationChannel(connectionId, (data) => {
    if (data?.type === "typing" && data.user_id !== currentUser?.id) {
      setIsTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    } else if (data?.type === "messages_read") {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
    } else if (data?.type === "reaction_added" || data?.type === "reaction_removed") {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
    } else if (data?.type === "pin_updated") {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.pinned(connectionId) });
    } else if (data?.data && data.data.type === "message") {
      // Direct WebSocket Cache Injection for Instant Delivery!
      const incomingMsg = data.data;
      
      // Skip injecting our own messages to avoid duplicating the Optimistic UI
      if (incomingMsg.attributes.sender_id === currentUser?.id) return;

      queryClient.setQueryData(queryKeys.messages.list(connectionId), (old: JsonApiResource<MessageAttributes>[] | undefined) => {
        if (!old) return [incomingMsg];
        if (old.some(m => m.id === incomingMsg.id)) return old;
        return [...old, incomingMsg];
      });
    } else {
      // Fallback for other events
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list(connectionId) });
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send typing indicator (throttled to once every 2s)
  const handleTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      lastTypingSentRef.current = now;
      sendTyping();
    }
  }, [sendTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile) {
      sendImageMutation.mutate({ file: imageFile, body });
      setBody("");
      clearImage();
      inputRef.current?.focus();
      return;
    }
    const trimmed = body.trim();
    if (!trimmed) return;
    send.mutate(trimmed, {
      onSuccess: () => {
        setBody("");
        inputRef.current?.focus();
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    reactToMessage.mutate({ messageId: Number(messageId), emoji });
    setReactionMsgId(null);
  };

  // Group messages by date
  let lastDateStr = "";

  // Find last own message to show read receipt
  const lastOwnMsgIndex = messages.reduceRight<number>((found, msg, i) => {
    if (found >= 0) return found;
    return msg.attributes.sender_id === currentUser?.id ? i : -1;
  }, -1);

  return (
    <div className="flex flex-col h-full bg-dark-bg" aria-label={`Chat with ${otherUserName}`}>
      {/* Desktop header */}
      <div className="hidden md:flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
        <button
          onClick={() => otherUser?.id && navigate(`/profile/${otherUser.id}`)}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="relative">
            <Avatar className="h-9 w-9">
              {otherUser?.avatar_url && <AvatarImage src={otherUser.avatar_url} alt={otherUserName} />}
              <AvatarFallback>{otherUserName[0]}</AvatarFallback>
            </Avatar>
            {isOtherOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-dark-bg rounded-full" />
            )}
          </div>
          <div className="text-left min-w-0">
            <p className="font-semibold text-white text-sm truncate hover:text-brand transition-colors">{otherUserName}</p>
            <p className="text-[11px] text-zinc-500 truncate">
              {isOtherOnline ? "Online" : otherUser?.intent?.replace(/_/g, " ") ?? "Connected"}
            </p>
          </div>
        </button>
        {onInfoClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onInfoClick}
            aria-label="Chat details"
            className="h-9 w-9 text-zinc-400 hover:text-white flex-shrink-0"
          >
            <Info size={18} />
          </Button>
        )}
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

        {messages.map((msg: JsonApiResource<MessageAttributes>, i: number) => {
          const attrs = msg.attributes;
          const isOwn = attrs.sender_id === currentUser?.id;
          const msgDate = attrs.created_at?.slice(0, 10);
          const showDivider = msgDate !== lastDateStr;
          if (showDivider) lastDateStr = msgDate;

          const next = messages[i + 1];
          const isLastInGroup = !next || next.attributes.sender_id !== attrs.sender_id;
          const isLastOwnMsg = isOwn && i === lastOwnMsgIndex;

          const referencedPost: ReferencedPost | null = attrs.referenced_post || null;
          const isGif = isGifUrl(attrs.body ?? "");
          const hasImage = !!attrs.image_url;

          return (
            <div key={msg.id}>
              {showDivider && <MessageDateDivider date={attrs.created_at} />}

              {/* Pinned indicator */}
              {attrs.pinned && (
                <div className="flex items-center gap-1 text-[10px] text-amber-400/70 mb-0.5 ml-9">
                  <Pin size={9} className="rotate-45" /> Pinned message
                </div>
              )}

              <div
                className={cn("group flex", isOwn ? "justify-end" : "justify-start", isLastInGroup ? "mb-3" : "mb-0.5")}
                onDoubleClick={() => setReactionMsgId(reactionMsgId === msg.id ? null : msg.id)}
              >
                {/* Other user avatar for last in group */}
                {!isOwn && isLastInGroup && (
                  <Avatar className="h-7 w-7 mr-2 mt-auto text-xs">
                    {otherUser?.avatar_url && <AvatarImage src={otherUser.avatar_url} alt={otherUserName} />}
                    <AvatarFallback className="text-xs">{otherUserName[0]}</AvatarFallback>
                  </Avatar>
                )}
                {!isOwn && !isLastInGroup && <div className="w-7 mr-2" />}

                <div className="flex flex-col">
                  {/* Message action buttons (show on hover) */}
                  <div className={cn(
                    "flex items-center gap-0.5 mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                    isOwn ? "justify-end" : "justify-start"
                  )}>
                    <button
                      onClick={() => setReactionMsgId(reactionMsgId === msg.id ? null : msg.id)}
                      className="p-1 rounded-md hover:bg-white/[0.06] text-zinc-600 hover:text-zinc-400 transition-colors"
                      aria-label="React"
                    >
                      <Smile size={12} />
                    </button>
                    <button
                      onClick={() => pinMessage.mutate(Number(msg.id))}
                      className={cn(
                        "p-1 rounded-md hover:bg-white/[0.06] transition-colors",
                        attrs.pinned ? "text-amber-400" : "text-zinc-600 hover:text-zinc-400"
                      )}
                      aria-label={attrs.pinned ? "Unpin" : "Pin"}
                    >
                      <Pin size={12} className={attrs.pinned ? "rotate-45" : ""} />
                    </button>
                  </div>

                  {/* Reaction picker (when active for this message) */}
                  {reactionMsgId === msg.id && (
                    <div className={cn(
                      "flex gap-1 p-1.5 mb-1 rounded-xl bg-zinc-900 border border-white/[0.08] shadow-lg animate-fade-in",
                      isOwn ? "self-end" : "self-start"
                    )}>
                      {REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="text-base hover:scale-125 transition-transform px-0.5"
                          aria-label={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[72%] sm:max-w-sm text-sm leading-relaxed",
                      referencedPost || isGif || hasImage
                        ? cn(
                            isOwn
                              ? "bg-brand text-white rounded-2xl rounded-br-sm"
                              : "bg-white/[0.04] backdrop-blur-sm text-white border border-white/[0.08] rounded-2xl rounded-bl-sm",
                            "overflow-hidden"
                          )
                        : cn(
                            "px-3.5 py-2",
                            isOwn
                              ? "bg-brand text-white rounded-2xl rounded-br-sm"
                              : "bg-white/[0.04] backdrop-blur-sm text-white border border-white/[0.08] rounded-2xl rounded-bl-sm"
                          )
                    )}
                  >
                    {/* Referenced post card */}
                    {referencedPost && (
                      <div className="p-1.5 pb-0">
                        <SharedPostCard post={referencedPost} isOwn={isOwn} />
                      </div>
                    )}

                    {/* Image attachment */}
                    {hasImage && (
                      <div className={referencedPost ? "px-1.5 pt-1" : "p-1"}>
                        <img
                          src={attrs.image_url}
                          alt="Shared image"
                          className="max-w-[220px] rounded-xl cursor-pointer"
                          loading="lazy"
                          onClick={() => window.open(attrs.image_url, "_blank")}
                        />
                      </div>
                    )}

                    {/* Message body */}
                    {attrs.body && isGifUrl(attrs.body) ? (
                      <div className={referencedPost ? "px-1.5 py-1" : "p-1"}>
                        <img
                          src={attrs.body.trim()}
                          alt="GIF"
                          className="max-w-[200px] rounded-xl"
                          loading="lazy"
                        />
                      </div>
                    ) : attrs.body ? (
                      <p className={referencedPost ? "px-3.5 py-1" : ""}>{attrs.body}</p>
                    ) : null}

                    {/* Shared post label if no body and no image */}
                    {!attrs.body && !hasImage && referencedPost && (
                      <p className={cn("px-3.5 py-1 text-xs", isOwn ? "text-pink-200/70" : "text-zinc-500")}>
                        <Heart size={10} className="inline mr-1" />Shared a post
                      </p>
                    )}

                    {/* Timestamp + read receipt */}
                    <p className={cn(
                      "text-[10px] mt-0.5 text-right flex items-center justify-end gap-1",
                      referencedPost && "px-3.5 pb-2",
                      isOwn ? "text-pink-200/70" : "text-zinc-600"
                    )}>
                      {formatDistanceToNow(new Date(attrs.created_at), { addSuffix: true })}
                      {isOwn && isLastOwnMsg && (
                        attrs.read
                          ? <CheckCheck size={12} className="text-blue-400" aria-label="Read" />
                          : <Check size={12} className="text-pink-200/50" aria-label="Sent" />
                      )}
                    </p>
                  </div>

                  {/* Reactions display */}
                  <ReactionsDisplay
                    reactions={attrs.reactions}
                    currentUserId={currentUser?.id ?? 0}
                    onToggle={(emoji) => handleReaction(msg.id, emoji)}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator name={otherUserName} />}

        <div ref={bottomRef} />
      </div>

      {/* Quick reactions emoji strip */}
      {showEmoji && (
        <div className="flex gap-3 px-4 py-2 border-t border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
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

      {/* GIF picker */}
      {showGif && (
        <GifPicker
          onSelect={(url) => {
            send.mutate(url);
            setShowGif(false);
          }}
          onClose={() => setShowGif(false)}
        />
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="px-3 py-2 border-t border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
              aria-label="Remove image"
            >
              <X size={10} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="px-3 py-3 border-t border-white/[0.08] bg-white/[0.02] backdrop-blur-xl flex items-center gap-2"
        aria-label="Send a message"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => { setShowEmoji((v) => !v); setShowGif(false); }}
          aria-label="Quick reactions"
          aria-expanded={showEmoji}
          className="h-9 w-9 text-zinc-500 hover:text-brand"
        >
          <Smile size={18} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Attach image"
          onClick={() => fileInputRef.current?.click()}
          className={cn("h-9 w-9", imageFile ? "text-brand" : "text-zinc-500 hover:text-brand")}
        >
          <ImageIcon size={18} />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => { setShowGif((v) => !v); setShowEmoji(false); }}
          aria-label="Send a GIF"
          aria-expanded={showGif}
          className={cn("h-9 w-9", showGif ? "text-brand" : "text-zinc-500 hover:text-brand")}
        >
          <span className="text-xs font-bold leading-none">GIF</span>
        </Button>

        <Input
          ref={inputRef}
          value={body}
          onChange={(e) => { setBody(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${otherUserName}...`}
          className="flex-1 rounded-xl"
          maxLength={2000}
          aria-label="Message input"
          autoComplete="off"
        />

        <Button
          type="submit"
          variant="pink"
          size="icon"
          disabled={(!body.trim() && !imageFile) || send.isPending || sendImageMutation.isPending}
          aria-label="Send message"
          className="h-9 w-9"
        >
          <Send size={15} />
        </Button>
      </form>
    </div>
  );
}
