import { Ban, UserX } from "lucide-react";
import { format } from "date-fns";
import type { BlockedUser } from "@/types";
import { useBlockedUsers, useUnblockUser } from "@/hooks/queries";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function BlockedUsersPage() {
  const { data: blockedUsers, isLoading } = useBlockedUsers();
  const unblockUser = useUnblockUser();

  return (
    <div className="relative max-w-2xl mx-auto px-4 py-6">
      <AuroraBg />

      <h1 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <Ban size={20} className="text-brand" />
        Blocked Users
      </h1>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-brand" />
        </div>
      )}

      {!isLoading && (!blockedUsers || blockedUsers.length === 0) && (
        <GlassCard className="flex flex-col items-center justify-center py-12 text-center">
          <UserX size={40} className="text-zinc-600 mb-3" />
          <p className="text-base font-medium text-zinc-300">No blocked users</p>
          <p className="text-sm text-zinc-500 mt-1">
            Users you block will appear here. You can unblock them at any time.
          </p>
        </GlassCard>
      )}

      {!isLoading && blockedUsers && blockedUsers.length > 0 && (
        <div className="space-y-3">
          {blockedUsers.map((user: BlockedUser) => (
            <GlassCard key={user.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                {user.blocked_avatar_url && (
                  <AvatarImage src={user.blocked_avatar_url} alt={user.blocked_name} />
                )}
                <AvatarFallback className="bg-zinc-800 text-zinc-400 text-sm">
                  {user.blocked_name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.blocked_name}
                </p>
                <p className="text-xs text-zinc-500">
                  Blocked on {format(new Date(user.created_at), "MMM d, yyyy")}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={unblockUser.isPending}
                onClick={() => unblockUser.mutate(user.blocked_id)}
              >
                {unblockUser.isPending ? "Unblocking..." : "Unblock"}
              </Button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
