import { Bell, CheckCheck, UserPlus, MessageSquare, Users, Info } from "lucide-react";
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/queries";
import type { JsonApiResource, NotificationAttributes } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const KIND_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  connection_request: { icon: UserPlus,       color: "text-brand bg-brand-muted border border-brand-border" },
  message:            { icon: MessageSquare,  color: "text-emerald-400 bg-emerald-900/30 border border-emerald-700/30" },
  group_invite:       { icon: Users,          color: "text-violet-400 bg-violet-900/30 border border-violet-700/30" },
  system:             { icon: Info,           color: "text-zinc-400 bg-dark-hover border border-dark-border" },
};

export function NotificationsPage() {
  const navigate    = useNavigate();

  const { data, isLoading } = useNotifications();

  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();

  const notifications: JsonApiResource<NotificationAttributes>[] = data?.notifications ?? [];
  const unreadCount: number  = data?.unreadCount ?? 0;

  const handleClick = (n: JsonApiResource<NotificationAttributes>) => {
    const meta = n.attributes.metadata ?? {};
    if (!n.attributes.read) markOne.mutate(Number(n.id));

    if (n.attributes.kind === "connection_request" && meta.connection_id) {
      navigate("/connections?tab=requests");
    } else if (n.attributes.kind === "message" && meta.connection_id) {
      navigate(`/chat/${meta.connection_id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-zinc-500">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="text-brand hover:text-brand-light"
          >
            <CheckCheck size={15} /> Mark all read
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <GlassCard key={i} padding="sm" className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-dark-hover flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-dark-hover rounded w-2/3" />
                <div className="h-3 bg-dark-hover rounded w-1/3" />
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-3">
          <Bell size={40} />
          <p className="text-sm">No notifications yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n: JsonApiResource<NotificationAttributes>) => {
          const cfg    = KIND_CONFIG[n.attributes.kind] ?? KIND_CONFIG.system;
          const Icon   = cfg.icon;
          const unread = !n.attributes.read;

          return (
            <GlassCard
              key={n.id}
              variant={unread ? "interactive" : "subtle"}
              padding="sm"
              onClick={() => handleClick(n)}
              className="flex items-start gap-3 cursor-pointer"
            >
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", cfg.color)}>
                <Icon size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", unread ? "font-semibold text-white" : "text-zinc-300")}>
                  {n.attributes.title}
                </p>
                {n.attributes.body && (
                  <p className="text-sm text-zinc-500 truncate">{n.attributes.body}</p>
                )}
                <p className="text-xs text-zinc-600 mt-0.5">
                  {formatDistanceToNow(new Date(n.attributes.created_at), { addSuffix: true })}
                </p>
              </div>
              {unread && (
                <div className="w-2 h-2 rounded-full bg-brand mt-2 flex-shrink-0" />
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
