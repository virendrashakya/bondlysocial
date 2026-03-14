import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Check, X, UserCheck, Clock } from "lucide-react";
import { connectionsService } from "../services/connections.service";
import { IntentBadge } from "../components/shared/IntentBadge";
import { AuroraBg } from "../components/ui/AuroraBg";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import clsx from "clsx";

type Tab = "connected" | "requests";

export function ConnectionsPage() {
  const [tab, setTab]   = useState<Tab>("connected");
  const navigate        = useNavigate();
  const queryClient     = useQueryClient();

  const { data: connData, isLoading: loadingConns } = useQuery({
    queryKey: ["connections"],
    queryFn:  () => connectionsService.getAll().then((r) => r.data.connections?.data ?? []),
  });

  const { data: reqData, isLoading: loadingReqs } = useQuery({
    queryKey: ["connection-requests"],
    queryFn:  () => connectionsService.getRequests().then((r) => r.data.requests?.data ?? []),
  });

  const accept = useMutation({
    mutationFn: (id: number) => connectionsService.accept(id),
    onSuccess: () => {
      toast.success("Connection accepted!");
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
    },
  });

  const reject = useMutation({
    mutationFn: (id: number) => connectionsService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
    },
  });

  const requests = reqData ?? [];
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
          <span className="flex items-center gap-1.5 text-xs text-brand font-medium bg-brand-muted border border-brand-border px-2.5 py-1 rounded-full">
            <i className="fa-solid fa-bell text-[10px]" aria-hidden="true" />
            {requests.length} pending
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-surface border border-dark-border p-1 rounded-xl mb-6 mt-5 w-fit">
        {(["connected", "requests"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
              tab === t
                ? "bg-brand text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {t === "requests" ? (
              <span className="flex items-center gap-1.5">
                Requests
                {requests.length > 0 && (
                  <span className="w-5 h-5 bg-brand text-white text-xs rounded-full flex items-center justify-center">
                    {requests.length}
                  </span>
                )}
              </span>
            ) : (
              "Connected"
            )}
          </button>
        ))}
      </div>

      {/* Connected */}
      {tab === "connected" && (
        <div className="space-y-3">
          {loadingConns && <Skeleton count={3} />}
          {!loadingConns && connections.length === 0 && (
            <Empty
              icon={<UserCheck size={32} className="text-zinc-600" />}
              text="No connections yet. Discover people and send a request."
              action={{ label: "Go to Discover", onClick: () => navigate("/discover") }}
            />
          )}
          {connections.map((c: any) => {
            const other = c.attributes.other_user;
            return (
              <div
                key={c.id}
                className="card p-4 flex items-center gap-4 hover:border-dark-border/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-brand-muted border border-brand-border flex-shrink-0 overflow-hidden">
                  {other?.avatar_url ? (
                    <img src={other.avatar_url} alt={other.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand font-semibold">
                      {other?.name?.[0] ?? "?"}
                    </div>
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
                <button
                  onClick={() => navigate(`/chat/${c.id}`)}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 bg-brand-muted text-brand border border-brand-border rounded-xl hover:bg-brand hover:text-white transition-colors"
                >
                  <MessageSquare size={15} />
                  Chat
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Requests */}
      {tab === "requests" && (
        <div className="space-y-3">
          {loadingReqs && <Skeleton count={2} />}
          {!loadingReqs && requests.length === 0 && (
            <Empty
              icon={<Clock size={32} className="text-zinc-600" />}
              text="No pending requests right now."
            />
          )}
          {requests.map((r: any) => {
            const other = r.attributes.other_user;
            return (
              <div
                key={r.id}
                className="card p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-brand-muted border border-brand-border flex-shrink-0 overflow-hidden">
                  {other?.avatar_url ? (
                    <img src={other.avatar_url} alt={other.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand font-semibold">
                      {other?.name?.[0] ?? "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{other?.name}</p>
                  <p className="text-xs text-zinc-500">
                    {other?.city} · {formatDistanceToNow(new Date(r.attributes.created_at), { addSuffix: true })}
                  </p>
                  {other?.intent && <IntentBadge intent={other.intent} size="sm" />}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => accept.mutate(Number(r.id))}
                    disabled={accept.isPending}
                    className="w-9 h-9 flex items-center justify-center bg-emerald-900/40 text-emerald-400 border border-emerald-700/40 rounded-xl hover:bg-emerald-800/50 transition-colors"
                    title="Accept"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => reject.mutate(Number(r.id))}
                    disabled={reject.isPending}
                    className="w-9 h-9 flex items-center justify-center bg-dark-hover text-zinc-400 border border-dark-border rounded-xl hover:bg-red-950/40 hover:text-red-400 transition-colors"
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Skeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-dark-hover" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-dark-hover rounded w-32" />
            <div className="h-3 bg-dark-hover rounded w-20" />
          </div>
        </div>
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
        <button onClick={action.onClick} className="btn-primary mt-1">
          {action.label}
        </button>
      )}
    </div>
  );
}
