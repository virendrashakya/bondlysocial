import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { connectionsService } from "../services/connections.service";
import { messagesService } from "../services/messages.service";
import { AuroraBg } from "../components/ui/AuroraBg";
import { IntentBadge } from "../components/shared/IntentBadge";
import { formatDistanceToNow } from "date-fns";

function ConversationItem({ connection, onClick }: { connection: any; onClick: () => void }) {
  const other = connection.attributes.other_user;

  const { data: msgData } = useQuery({
    queryKey: ["messages-preview", Number(connection.id)],
    queryFn: () =>
      messagesService.getMessages(Number(connection.id)).then((r) => r.data.messages?.data ?? []),
    staleTime: 30_000,
  });

  const messages: any[] = msgData ?? [];
  const lastMsg = messages[messages.length - 1];
  const preview = lastMsg?.attributes?.body ?? "Say hello!";
  const ts = lastMsg?.attributes?.created_at ?? connection.attributes.created_at;

  if (!other) return null;

  return (
    <button
      onClick={onClick}
      className="card w-full p-4 flex items-center gap-4 hover:border-brand-border/60 transition-all text-left active:scale-[0.99]"
      aria-label={`Open chat with ${other.name}`}
    >
      {/* Avatar */}
      <div className="relative w-12 h-12 rounded-full bg-brand-muted border border-brand-border overflow-hidden flex-shrink-0 flex items-center justify-center text-brand font-semibold">
        {other.avatar_url ? (
          <img src={other.avatar_url} alt={other.name} className="w-full h-full object-cover" />
        ) : (
          <span>{other.name?.[0]}</span>
        )}
        {/* Online dot — cosmetic */}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-surface" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold text-white truncate">{other.name}</span>
          {other.verified && (
            <ShieldCheck size={12} className="text-emerald-400 flex-shrink-0" aria-label="Verified" />
          )}
        </div>
        {other.intent && (
          <div className="mb-1">
            <IntentBadge intent={other.intent} size="sm" />
          </div>
        )}
        <p className="text-xs text-zinc-500 truncate">{preview}</p>
      </div>

      {/* Timestamp */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-zinc-600">
          {formatDistanceToNow(new Date(ts), { addSuffix: false })}
        </span>
        {/* Unread badge placeholder */}
      </div>
    </button>
  );
}

export function MessagesPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: () => connectionsService.getAll().then((r) => r.data.connections?.data ?? []),
  });

  const connections: any[] = data ?? [];

  return (
    <div className="relative max-w-2xl mx-auto px-4 py-6">
      <AuroraBg />

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <i className="fa-solid fa-comments text-brand text-base" aria-hidden="true" />
          <h1 className="text-xl font-bold text-white">Messages</h1>
        </div>
        <p className="text-sm text-zinc-500">
          {connections.length > 0
            ? `${connections.length} conversation${connections.length === 1 ? "" : "s"}`
            : "Your conversations will appear here"}
        </p>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-dark-hover flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-dark-hover rounded w-28" />
                <div className="h-2.5 bg-dark-hover rounded w-40" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && connections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-brand-muted border border-brand-border flex items-center justify-center mb-1">
            <i className="fa-regular fa-comments text-2xl text-brand" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-white">No conversations yet</p>
          <p className="text-xs text-zinc-600 max-w-xs">
            Connect with people on Discover to start chatting.
          </p>
          <button
            onClick={() => navigate("/discover")}
            className="btn-primary mt-2"
          >
            Discover people
          </button>
        </div>
      )}

      {/* Conversation list */}
      {!isLoading && connections.length > 0 && (
        <div className="space-y-2" role="list" aria-label="Conversations">
          {connections.map((c: any) => (
            <div key={c.id} role="listitem">
              <ConversationItem
                connection={c}
                onClick={() => navigate(`/chat/${c.id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
