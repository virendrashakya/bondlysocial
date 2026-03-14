import { useNavigate } from "react-router-dom";
import { MessageSquare, Check, X, UserCheck, Clock } from "lucide-react";
import { useConnections, useConnectionRequests, useAcceptConnection, useRejectConnection } from "@/hooks/queries";
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
  const accept = useAcceptConnection();
  const reject = useRejectConnection();

  const requests    = reqData ?? [];
  const connections = connData ?? [];

  return (
    <div className="relative max-w-2xl mx-auto px-4 py-6">
      <AuroraBg />

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <i className="fa-solid fa-user-group text-brand text-base" aria-hidden="true" />
            <h1 className="text-xl font-bold text-white">Your Connections</h1>
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
        </TabsList>

        {/* Connected tab */}
        <TabsContent value="connected">
          <div className="space-y-3">
            {loadingConns && <Skeleton count={3} />}
            {!loadingConns && connections.length === 0 && (
              <Empty
                icon={<UserCheck size={32} className="text-zinc-600" />}
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
                  className="flex items-center gap-4"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={other?.avatar_url} alt={other?.name} />
                    <AvatarFallback>{other?.name?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{other?.name}</p>
                    <p className="text-xs text-zinc-500">
                      {other?.city} · {formatDistanceToNow(new Date(r.attributes.created_at), { addSuffix: true })}
                    </p>
                    {other?.intent && <IntentBadge intent={other.intent} size="sm" />}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="glass"
                      size="icon"
                      onClick={() => accept.mutate(Number(r.id))}
                      disabled={accept.isPending}
                      title="Accept"
                      className="h-9 w-9 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check size={16} />
                    </Button>
                    <Button
                      variant="glass"
                      size="icon"
                      onClick={() => reject.mutate(Number(r.id))}
                      disabled={reject.isPending}
                      title="Reject"
                      className="h-9 w-9 text-zinc-400 hover:text-red-400"
                    >
                      <X size={16} />
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

function Empty({ icon, text, action }: { icon: React.ReactNode; text: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {icon}
      <p className="text-sm text-zinc-500 max-w-xs">{text}</p>
      {action && (
        <Button variant="pink" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </div>
  );
}
