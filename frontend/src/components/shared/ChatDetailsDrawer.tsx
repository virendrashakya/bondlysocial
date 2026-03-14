import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X, User, Calendar, Image, Video, ShieldCheck, Flag, Ban, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { messagesService } from "@/services/messages.service";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ChatDetailsDrawerProps {
  connectionId: number;
  otherUser: any;
  otherUserName: string;
  connectedAt?: string;
  onClose: () => void;
}

export function ChatDetailsDrawer({
  connectionId,
  otherUser,
  otherUserName,
  connectedAt,
  onClose,
}: ChatDetailsDrawerProps) {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["messages", connectionId],
    queryFn: () => messagesService.getMessages(connectionId).then((r) => r.data.messages),
  });

  const messages: any[] = data?.data ?? [];

  // Extract shared media from messages
  const sharedMedia = messages
    .flatMap((msg: any) => {
      const items: { url: string; type: "image" | "video"; date: string }[] = [];
      const attrs = msg.attributes;
      // From referenced posts
      if (attrs.referenced_post?.media_url) {
        items.push({
          url: attrs.referenced_post.media_url,
          type: attrs.referenced_post.media_type || "image",
          date: attrs.created_at,
        });
      }
      // From image attachments
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
                navigate(`/profile/${otherUser?.id}`);
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
                navigate(`/profile/${otherUser?.id}/posts`);
              }}
            >
              <Image size={14} /> View {otherUserName}'s Posts
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-zinc-500 hover:text-amber-400"
            >
              <Flag size={14} /> Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-zinc-500 hover:text-red-400"
            >
              <Ban size={14} /> Block
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
