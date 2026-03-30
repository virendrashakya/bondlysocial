import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, MapPin, Send, Crown, LogOut, UserPlus, MessageCircle } from "lucide-react";
import { groupsService } from "@/services/groups.service";
import { useAuthStore } from "@/store/authStore";
import { useGroupChannel } from "@/hooks/useActionCable";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import type { GroupAttributes, GroupMember, GroupMessage, JsonApiResource } from "@/types";

type Tab = "members" | "chat";

const CATEGORY_BADGE_VARIANT: Record<string, "brand" | "success" | "violet" | "info" | "warning" | "danger" | "default"> = {
  fitness: "success", social: "violet", tech: "info", arts: "brand",
  outdoors: "success", food: "warning", spiritual: "violet",
};

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const groupId = Number(id);

  const [tab, setTab] = useState<Tab>("members");

  // Fetch group detail
  const { data, isLoading } = useQuery({
    queryKey: ["groups", groupId],
    queryFn: () =>
      groupsService.getOne(groupId).then((r) => {
        const d = r.data.group?.data ?? r.data.group;
        return (d?.attributes ?? d) as GroupAttributes & { id: number };
      }),
    enabled: !!groupId,
  });

  const group = data;
  const isMember = group?.is_member ?? false;

  // Join
  const join = useMutation({
    mutationFn: () => groupsService.join(groupId),
    onSuccess: () => {
      toast.success("Joined group!");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: () => toast.error("Could not join group"),
  });

  // Leave
  const leave = useMutation({
    mutationFn: () => groupsService.leave(groupId),
    onSuccess: () => {
      toast.success("Left group");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: () => toast.error("Could not leave group"),
  });

  // Send connection request
  const sendConnection = useMutation({
    mutationFn: (receiverId: number) =>
      import("@/lib/api").then(({ api }) => api.post("/connections", { receiver_id: receiverId })),
    onSuccess: () => toast.success("Connection request sent!"),
    onError: () => toast.error("Could not send request"),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        <div className="h-8 w-48 bg-white/[0.06] rounded animate-pulse" />
        <GlassCard padding="default" className="space-y-3 animate-pulse">
          <div className="h-5 w-3/4 bg-white/[0.06] rounded" />
          <div className="h-4 w-1/2 bg-white/[0.06] rounded" />
          <div className="h-20 bg-white/[0.06] rounded" />
        </GlassCard>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-500">Group not found</p>
        <Button variant="secondary" onClick={() => navigate("/groups")} className="mt-4">Back to groups</Button>
      </div>
    );
  }

  const fill = Math.min(100, Math.round(((group.members_count ?? 0) / (group.max_members ?? 20)) * 100));
  const badgeVar = group.category ? CATEGORY_BADGE_VARIANT[group.category] ?? "default" : "default";

  return (
    <div className="relative max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <AuroraBg />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="icon" onClick={() => navigate("/groups")} className="text-zinc-500 hover:text-white">
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white truncate">{group.title}</h1>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <MapPin size={11} />
            <span>{group.city}</span>
            {group.category && <Badge variant={badgeVar} size="sm">{group.category}</Badge>}
          </div>
        </div>
        {isMember ? (
          <Button variant="secondary" size="sm" onClick={() => leave.mutate()} disabled={leave.isPending} className="gap-1.5 text-red-400 border-red-800/30 hover:bg-red-900/20">
            <LogOut size={13} /> Leave
          </Button>
        ) : (
          <Button size="sm" onClick={() => join.mutate()} disabled={join.isPending} className="gap-1.5">
            <UserPlus size={13} /> Join
          </Button>
        )}
      </div>

      {/* Group info card */}
      <GlassCard padding="default" className="mb-5 space-y-3">
        {group.description && <p className="text-sm text-zinc-300">{group.description}</p>}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1"><Users size={12} /> {group.members_count ?? 0} / {group.max_members} members</span>
          <span>{fill}% full</span>
        </div>
        <div className="h-1.5 bg-dark-hover rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", fill >= 80 ? "bg-rose-500" : fill >= 50 ? "bg-amber-400" : "bg-brand")}
            style={{ width: `${fill}%` }}
          />
        </div>
        {group.creator_name && (
          <p className="text-xs text-zinc-600">Created by {group.creator_name}</p>
        )}
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-white/[0.08] pb-px">
        <button
          onClick={() => setTab("members")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors",
            tab === "members" ? "text-brand border-b-2 border-brand bg-brand/5" : "text-zinc-500 hover:text-white"
          )}
        >
          <Users size={14} className="inline mr-1.5" />
          Members ({group.members_count ?? 0})
        </button>
        {isMember && (
          <button
            onClick={() => setTab("chat")}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors",
              tab === "chat" ? "text-brand border-b-2 border-brand bg-brand/5" : "text-zinc-500 hover:text-white"
            )}
          >
            <MessageCircle size={14} className="inline mr-1.5" />
            Chat
          </button>
        )}
      </div>

      {/* Tab content */}
      {tab === "members" && (
        <MembersList
          members={group.members ?? []}
          currentUserId={user?.id}
          onConnect={(memberId) => sendConnection.mutate(memberId)}
          onViewProfile={(memberId) => navigate(`/profile/${memberId}`)}
          connectPending={sendConnection.isPending}
        />
      )}

      {tab === "chat" && isMember && (
        <GroupChat groupId={groupId} currentUserId={user?.id ?? 0} />
      )}

      {tab === "chat" && !isMember && (
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">Join this group to access the chat</p>
          <Button size="sm" onClick={() => join.mutate()} disabled={join.isPending} className="mt-3">Join group</Button>
        </div>
      )}
    </div>
  );
}

// --- Members List ---
function MembersList({ members, currentUserId, onConnect, onViewProfile, connectPending }: {
  members: GroupMember[];
  currentUserId?: number;
  onConnect: (id: number) => void;
  onViewProfile: (id: number) => void;
  connectPending: boolean;
}) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={32} className="mx-auto text-zinc-700 mb-3" />
        <p className="text-sm text-zinc-500">No members yet. Be the first to join!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isMe = member.id === currentUserId;
        return (
          <GlassCard key={member.id} variant="interactive" padding="sm" className="flex items-center gap-3">
            <button onClick={() => !isMe && onViewProfile(member.id)} className="flex-shrink-0">
              <Avatar className="h-11 w-11 text-sm">
                {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.name} />}
                <AvatarFallback>{member.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
            </button>

            <div className="flex-1 min-w-0" onClick={() => !isMe && onViewProfile(member.id)} role="button" tabIndex={0}>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-white truncate">{member.name ?? "Anonymous"}</p>
                {member.role === "admin" && (
                  <Crown size={12} className="text-amber-400 flex-shrink-0" />
                )}
                {isMe && <span className="text-[10px] text-zinc-600">(you)</span>}
              </div>
              {member.city && (
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  <MapPin size={9} /> {member.city}
                </p>
              )}
              {member.interests && member.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.interests.slice(0, 4).map((interest) => (
                    <span key={interest} className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] rounded-full text-zinc-400">
                      {interest}
                    </span>
                  ))}
                  {member.interests.length > 4 && (
                    <span className="text-[10px] text-zinc-600">+{member.interests.length - 4}</span>
                  )}
                </div>
              )}
            </div>

            {!isMe && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onConnect(member.id)}
                disabled={connectPending}
                className="flex-shrink-0 gap-1"
              >
                <UserPlus size={12} />
                Connect
              </Button>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}

// --- Group Chat ---
function GroupChat({ groupId, currentUserId }: { groupId: number; currentUserId: number }) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const { data: fetchedMessages, isLoading } = useQuery({
    queryKey: ["group-messages", groupId],
    queryFn: () => groupsService.getMessages(groupId).then((r) => r.data.messages as GroupMessage[]),
  });

  // Sync fetched messages into local state
  useEffect(() => {
    if (fetchedMessages) setMessages(fetchedMessages);
  }, [fetchedMessages]);

  // Real-time messages via ActionCable
  const handleCableMessage = useCallback((data: { type: string; message: GroupMessage }) => {
    if (data.type === "message") {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    }
  }, []);

  useGroupChannel(groupId, handleCableMessage);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await groupsService.sendMessage(groupId, body);
      const msg = res.data.message as GroupMessage;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch {
      toast.error("Failed to send message");
      setInput(body);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 380px)", minHeight: "300px" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scroll-touch">
        {isLoading && (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-white/[0.06] rounded" />
                  <div className="h-8 w-40 bg-white/[0.06] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle size={28} className="mx-auto text-zinc-700 mb-2" />
            <p className="text-sm text-zinc-500">No messages yet. Start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.user_id === currentUserId;
          return (
            <div key={msg.id} className={cn("flex gap-2 py-1", isMe && "flex-row-reverse")}>
              {!isMe && (
                <Avatar className="h-7 w-7 text-[10px] flex-shrink-0 mt-1">
                  {msg.user_avatar && <AvatarImage src={msg.user_avatar} alt={msg.user_name} />}
                  <AvatarFallback>{msg.user_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-[75%]", isMe && "text-right")}>
                {!isMe && (
                  <p className="text-[10px] text-zinc-600 mb-0.5 ml-1">{msg.user_name}</p>
                )}
                <div className={cn(
                  "inline-block px-3 py-2 rounded-2xl text-sm break-words",
                  isMe
                    ? "bg-brand text-white rounded-br-md"
                    : "bg-white/[0.06] text-zinc-200 rounded-bl-md"
                )}>
                  {msg.body}
                </div>
                <p className={cn("text-[9px] text-zinc-600 mt-0.5", isMe ? "mr-1" : "ml-1")}>
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.08] mt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
          maxLength={1000}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          size="icon"
          className="h-10 w-10 rounded-xl flex-shrink-0"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
