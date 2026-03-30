import { useNavigate } from "react-router-dom";
import { MessageSquare, Check, X, UserCheck, Clock, Send } from "lucide-react";
import { useConnections, useConnectionRequests, useAcceptConnection, useRejectConnection, useSentRequests, useCancelSent } from "@/hooks/queries";
import { usePresenceStore } from "@/store/presenceStore";
import type { JsonApiResource, ConnectionAttributes } from "@/types";
import { IntentBadge } from "@/components/shared/IntentBadge";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function ConnectionsPage() {
  const navigate = useNavigate();

  const { data: connData, isLoading: loadingConns } = useConnections();
  const { data: reqData, isLoading: loadingReqs } = useConnectionRequests();
  const { data: sentData, isLoading: loadingSent } = useSentRequests();
  const accept = useAcceptConnection();
  const reject = useRejectConnection();
  const cancelSent = useCancelSent();

  const requests    = reqData ?? [];
  const connections = connData ?? [];
  const sentRequests = sentData ?? [];

  return (
    <div className="relative max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <AuroraBg />

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <i className="fa-solid fa-user-group text-brand text-base" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gradient">Your Connections</h1>
          </div>
          <p className="text-sm text-zinc-500">
            People you've connected with · {connections.length} connected
          </p>
        </div>
        {requests.length > 0 && (
          <Badge variant="brand">
            <i className="fa-solid fa-bell text-[10px]" aria-hidden="true" />
            {requests.length} pending
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="connected" className="mt-5">
        <TabsList>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="requests">
            <span className="flex items-center gap-1.5">
              Requests
              {requests.length > 0 && (
                <span className="w-5 h-5 bg-brand text-white text-xs rounded-full flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger value="sent">
            <span className="flex items-center gap-1.5">
              Sent
              {sentRequests.length > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                  {sentRequests.length}
                </span>
              )}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Connected tab */}
        <TabsContent value="connected">
          <div className="space-y-3">
            {loadingConns && <Skeleton count={3} />}
            {!loadingConns && connections.length === 0 && (
              <Empty
                icon={<UserCheck size={32} className="text-zinc-600" />}
                illustration="/illustrations/signup-hero.png"
                text="No connections yet. Discover people and send a request."
                action={{ label: "Go to Discover", onClick: () => navigate("/discover") }}
              />
            )}
            {connections.map((c: JsonApiResource<ConnectionAttributes>) => (
              <ConnectionCard key={c.id} connection={c} onChat={() => navigate(`/chat/${c.id}`)} />
            ))}
          </div>
        </TabsContent>

        {/* Requests tab */}
        <TabsContent value="requests">
          <div className="space-y-3">
            {loadingReqs && <Skeleton count={2} />}
            {!loadingReqs && requests.length === 0 && (
              <Empty
                icon={<Clock size={32} className="text-zinc-600" />}
                text="No pending requests right now."
              />
            )}
            {requests.map((r: JsonApiResource<ConnectionAttributes>) => {
              const other = r.attributes.other_user;
              return (
                <GlassCard
                  key={r.id}
                  padding="sm"
                  className="flex items-center gap-3"
                >
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={other?.avatar_url} alt={other?.name} />
                    <AvatarFallback>{other?.name?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{other?.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {other?.city} · {formatDistanceToNow(new Date(r.attributes.created_at), { addSuffix: true })}
                    </p>
                    {other?.intent && <IntentBadge intent={other.intent} size="sm" />}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button
                      variant="glass"
                      size="icon"
                      onClick={() => accept.mutate(Number(r.id))}
                      disabled={accept.isPending}
                      title="Accept"
                      className="h-8 w-8 sm:h-9 sm:w-9 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check size={15} />
                    </Button>
                    <Button
                      variant="glass"
                      size="icon"
                      onClick={() => reject.mutate(Number(r.id))}
                      disabled={reject.isPending}
                      title="Reject"
                      className="h-8 w-8 sm:h-9 sm:w-9 text-zinc-400 hover:text-red-400"
                    >
                      <X size={15} />
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </TabsContent>

        {/* Sent tab */}
        <TabsContent value="sent">
          <div className="space-y-3">
            {loadingSent && <Skeleton count={2} />}
            {!loadingSent && sentRequests.length === 0 && (
              <Empty
                icon={<Send size={32} className="text-zinc-600" />}
                text="You haven't sent any requests yet. Go discover new people!"
                action={{ label: "Go to Discover", onClick: () => navigate("/discover") }}
              />
            )}
            {sentRequests.map((r: JsonApiResource<ConnectionAttributes>) => {
              const other = r.attributes.other_user;
              return (
                <GlassCard
                  key={r.id}
                  padding="sm"
                  className="flex items-center gap-3"
                >
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={other?.avatar_url} alt={other?.name} />
                    <AvatarFallback>{other?.name?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{other?.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {other?.city} · {formatDistanceToNow(new Date(r.attributes.created_at), { addSuffix: true })}
                    </p>
                    {other?.intent && <IntentBadge intent={other.intent} size="sm" />}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant="default" className="text-amber-500 border-amber-500/20 bg-amber-500/10 text-[10px]">
                      <Clock size={10} />
                      Pending
                    </Badge>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => cancelSent.mutate(Number(r.id))}
                      disabled={cancelSent.isPending}
                      className="text-zinc-400 hover:text-red-400 text-[11px] h-7 px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConnectionCard({ connection, onChat }: { connection: JsonApiResource<ConnectionAttributes>; onChat: () => void }) {
  const other = connection.attributes.other_user;
  const isOnline = usePresenceStore((s) => other?.id ? s.isOnline(other.id) : false);

  return (
    <GlassCard
      padding="sm"
      className="flex items-center gap-4 hover:border-white/[0.14] transition-colors"
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={other?.avatar_url} alt={other?.name} />
          <AvatarFallback>{other?.name?.[0] ?? "?"}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-surface" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white">{other?.name}</p>
          {other?.verified && (
            <span className="text-emerald-400 text-xs font-medium">✓ Verified</span>
          )}
        </div>
        <p className="text-xs text-zinc-500">{other?.city}</p>
        {other?.intent && <IntentBadge intent={other.intent} size="sm" />}
      </div>
      <Button
        variant="pink"
        size="sm"
        onClick={onChat}
      >
        <MessageSquare size={15} />
        Chat
      </Button>
    </GlassCard>
  );
}

function Skeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <GlassCard key={i} padding="sm" className="flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-dark-hover" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-dark-hover rounded w-32" />
            <div className="h-3 bg-dark-hover rounded w-20" />
          </div>
        </GlassCard>
      ))}
    </>
  );
}

function Empty({ icon, text, action, illustration }: { icon: React.ReactNode; text: string; action?: { label: string; onClick: () => void }; illustration?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
      {illustration ? (
        <img src={illustration} alt="" className="w-28 h-auto object-contain mb-1 opacity-80" />
      ) : (
        icon
      )}
      <p className="text-sm text-zinc-400 max-w-xs">{text}</p>
      {action && (
        <Button variant="pink" onClick={action.onClick} className="mt-2 animate-glow-pulse">
          {action.label}
        </Button>
      )}
    </div>
  );
}
