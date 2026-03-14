import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { adminService } from "../../services/admin.service";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AdminUser {
  id: number;
  email: string;
  name?: string;
  avatar_url?: string;
  status: string;
  role?: string;
  email_verified?: boolean;
  id_verified?: boolean;
}

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const queryClient         = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => adminService.getUsers({ search, page }).then(r => r.data.users ?? []),
    enabled: true,
  });

  const suspend = useMutation({
    mutationFn: (id: number) => adminService.suspendUser(id),
    onSuccess: () => {
      toast.success("User suspended");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const unsuspend = useMutation({
    mutationFn: (id: number) => adminService.unsuspendUser(id),
    onSuccess: () => {
      toast.success("User reactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const users: AdminUser[] = data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-sm text-zinc-500 mb-5">Manage platform members</p>

      <div className="flex items-center gap-2 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="pl-9"
          />
        </div>
      </div>

      <GlassCard padding="none" className="overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.08] grid grid-cols-12 text-xs font-medium text-zinc-500 uppercase tracking-wide">
          <span className="col-span-4">User</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Verified</span>
          <span className="col-span-2">Role</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-3 text-center text-sm text-zinc-500">
            <p className="py-10">No users found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {users.map((user: AdminUser) => (
              <div
                key={user.id}
                className="px-5 py-3 grid grid-cols-12 items-center hover:bg-white/[0.03] transition-colors"
              >
                {/* User */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={user.avatar_url} alt={user.name ?? user.email} />
                    <AvatarFallback className="text-xs bg-zinc-800 text-zinc-400">
                      {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name ?? "—"}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  {user.status === "suspended" ? (
                    <Badge variant="danger" size="sm">Suspended</Badge>
                  ) : (
                    <Badge variant="success" size="sm">Active</Badge>
                  )}
                </div>

                {/* Verified */}
                <div className="col-span-2 flex gap-1">
                  {user.email_verified && (
                    <Badge variant="default" size="sm">Email</Badge>
                  )}
                  {user.id_verified && (
                    <Badge variant="default" size="sm">ID</Badge>
                  )}
                  {!user.email_verified && !user.id_verified && (
                    <span className="text-xs text-zinc-600">None</span>
                  )}
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <span className="text-sm text-zinc-400 capitalize">{user.role ?? "user"}</span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end">
                  {user.status === "suspended" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                      onClick={() => unsuspend.mutate(user.id)}
                      disabled={unsuspend.isPending}
                    >
                      Unsuspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-rose-400 hover:text-rose-300"
                      onClick={() => suspend.mutate(user.id)}
                      disabled={suspend.isPending}
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button
          size="sm"
          variant="ghost"
          className="text-zinc-400"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-sm text-zinc-500">Page {page}</span>
        <Button
          size="sm"
          variant="ghost"
          className="text-zinc-400"
          disabled={users.length === 0}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
