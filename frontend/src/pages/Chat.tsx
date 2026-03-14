import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { connectionsService } from "@/services/connections.service";
import { ChatWindow } from "@/components/shared/ChatWindow";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function ChatPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const connectionId = Number(id);

  const { data, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn:  () => connectionsService.getAll().then((r) => r.data.connections?.data ?? []),
  });

  const connection = (data ?? []).find((c: any) => Number(c.id) === connectionId);
  const otherUser  = connection?.attributes?.other_user;
  const otherName  = otherUser?.name ?? "Chat";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading chat">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!connection && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-zinc-500">
        <i className="fa-solid fa-comment-slash text-3xl text-zinc-700" aria-hidden="true" />
        <p className="text-sm">Connection not found.</p>
        <Button variant="secondary" onClick={() => navigate("/chat")}>
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile header */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-dark-surface border-b border-dark-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/connections")}
          aria-label="Back to connections"
          className="h-9 w-9 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage src={otherUser?.avatar_url} alt={otherName} />
          <AvatarFallback>{otherName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white text-sm">{otherName}</span>
            {otherUser?.verified && (
              <ShieldCheck size={13} className="text-emerald-400" aria-label="Verified user" />
            )}
          </div>
          <span className="text-[11px] text-zinc-500">
            {otherUser?.intent?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {connectionId && (
          <ChatWindow connectionId={connectionId} otherUserName={otherName} otherUser={otherUser} />
        )}
      </div>
    </div>
  );
}
