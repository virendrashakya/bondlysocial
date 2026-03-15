import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, User, Calendar, Image, Video, ShieldCheck, Flag, Ban, ExternalLink, Pin, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useMessages, usePinnedMessages, useBlockUser, useReportUser } from "@/hooks/queries";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { OtherUser } from "@/types";

interface ChatDetailsDrawerProps {
  connectionId: number;
  otherUser: OtherUser;
  otherUserName: string;
  connectedAt?: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: "harassment", label: "Harassment" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
] as const;

export function ChatDetailsDrawer({
  connectionId,
  otherUser,
  otherUserName,
  connectedAt,
  onClose,
}: ChatDetailsDrawerProps) {
  const navigate = useNavigate();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [reportReason, setReportReason] = useState("harassment");
  const [reportDetails, setReportDetails] = useState("");

  const { data: messages = [] } = useMessages(connectionId);
  const { data: pinnedMessages = [] } = usePinnedMessages(connectionId);
  const blockUser = useBlockUser();
  const reportUser = useReportUser();

  // Extract shared media from messages
  const sharedMedia = messages
    .flatMap((msg) => {
      const items: { url: string; type: "image" | "video"; date: string }[] = [];
      const attrs = msg.attributes;
      if (attrs.referenced_post?.media_url) {
        items.push({
          url: attrs.referenced_post.media_url,
          type: attrs.referenced_post.media_type || "image",
          date: attrs.created_at,
        });
      }
      if (attrs.image_url) {
        items.push({
          url: attrs.image_url,
          type: "image",
          date: attrs.created_at,
        });
      }
      return items;
    })
    .slice(0, 20);

  const totalMessages = messages.length;

  const handleBlock = () => {
    if (!otherUser?.id) return;
    blockUser.mutate(otherUser.id, {
      onSuccess: () => {
        setShowBlockConfirm(false);
        onClose();
        navigate("/messages");
      },
    });
  };

  const handleReport = () => {
    if (!otherUser?.id) return;
    reportUser.mutate(
      { reportedId: otherUser.id, reason: reportReason, details: reportDetails || undefined },
      { onSuccess: () => { setShowReportDialog(false); setReportDetails(""); } }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-sm bg-[rgba(12,12,12,0.96)] backdrop-blur-2xl border-l border-white/[0.08] flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <h2 className="text-sm font-semibold text-white">Chat Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-zinc-500 hover:text-white"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User profile section */}
          <div className="px-5 py-6 flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 text-2xl mb-3">
              {otherUser?.avatar_url && (
                <AvatarImage src={otherUser.avatar_url} alt={otherUserName} />
              )}
              <AvatarFallback>{otherUserName[0]}</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              {otherUserName}
              {otherUser?.verified && (
                <ShieldCheck size={15} className="text-emerald-400" />
              )}
            </h3>
            {otherUser?.intent && (
              <p className="text-xs text-zinc-500 capitalize mt-0.5">
                {otherUser.intent.replace(/_/g, " ")}
              </p>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => {
                onClose();
                if (otherUser?.id) navigate(`/profile/${otherUser.id}`);
              }}
            >
              <User size={14} /> View Profile
            </Button>
          </div>

          <Separator />

          {/* Chat stats */}
          <div className="px-5 py-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Info</p>
            <div className="space-y-2.5">
              {connectedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={14} className="text-zinc-500 flex-shrink-0" />
                  <span className="text-zinc-400">
                    Connected {format(new Date(connectedAt), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <ExternalLink size={14} className="text-zinc-500 flex-shrink-0" />
                <span className="text-zinc-400">
                  {totalMessages} message{totalMessages !== 1 ? "s" : ""} exchanged
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pinned messages */}
          {pinnedMessages.length > 0 && (
            <>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Pinned Messages
                  </p>
                  <Badge variant="default" size="sm">{pinnedMessages.length}</Badge>
                </div>
                <div className="space-y-2">
                  {pinnedMessages.slice(0, 5).map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      <Pin size={12} className="text-amber-400 mt-0.5 rotate-45 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-300 line-clamp-2">{msg.attributes.body || "Shared media"}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{msg.attributes.sender_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Shared media */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Shared Media
              </p>
              {sharedMedia.length > 0 && (
                <Badge variant="default" size="sm">{sharedMedia.length}</Badge>
              )}
            </div>

            {sharedMedia.length === 0 ? (
              <GlassCard variant="subtle" padding="sm" className="text-center">
                <Image size={20} className="text-zinc-600 mx-auto mb-1.5" />
                <p className="text-xs text-zinc-500">No shared media yet</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {sharedMedia.map((item, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden bg-white/[0.04] relative"
                  >
                    {item.type === "video" ? (
                      <>
                        <video src={item.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
                            <Video size={12} className="text-white ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="px-5 py-4 space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Actions</p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onClose();
                if (otherUser?.id) navigate(`/profile/${otherUser.id}/posts`);
              }}
            >
              <Image size={14} /> View {otherUserName}'s Posts
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-zinc-500 hover:text-amber-400"
              onClick={() => setShowReportDialog(true)}
            >
              <Flag size={14} /> Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-zinc-500 hover:text-red-400"
              onClick={() => setShowBlockConfirm(true)}
            >
              <Ban size={14} /> Block
            </Button>
          </div>
        </div>
      </div>

      {/* Report dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowReportDialog(false)} />
          <div className="relative bg-zinc-900 border border-white/[0.08] rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flag size={14} className="text-amber-400" /> Report {otherUserName}
            </h3>
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">Select a reason:</p>
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-sm",
                    reportReason === r.value
                      ? "border-amber-500/50 bg-amber-900/10 text-white"
                      : "border-white/[0.08] text-zinc-400 hover:border-zinc-600"
                  )}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reportReason === r.value}
                    onChange={() => setReportReason(r.value)}
                    className="accent-amber-400"
                  />
                  {r.label}
                </label>
              ))}
              <Textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Additional details (optional)..."
                rows={2}
                maxLength={500}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="pink"
                size="sm"
                className="flex-1"
                onClick={handleReport}
                disabled={reportUser.isPending}
              >
                {reportUser.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Block confirm dialog */}
      {showBlockConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowBlockConfirm(false)} />
          <div className="relative bg-zinc-900 border border-white/[0.08] rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-400" /> Block {otherUserName}?
            </h3>
            <p className="text-sm text-zinc-400">
              This will remove your connection and prevent {otherUserName} from seeing your profile, sending messages, or appearing in your suggestions. This action can be undone from Settings.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setShowBlockConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleBlock}
                disabled={blockUser.isPending}
              >
                {blockUser.isPending ? "Blocking..." : "Block User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
