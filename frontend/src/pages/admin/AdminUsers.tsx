import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { adminService } from "../../services/admin.service";
import { api } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";

export function AdminUsersPage() {
  const [search, setSearch]     = useState("");
  const [page,   _setPage]      = useState(1);
  const queryClient             = useQueryClient();

  const { data: _data, isLoading: _isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () =>
      api.get("/admin/reports", { params: { status: "open" } })
        .then(() => api.get("/connections"))
        .catch(() => ({ data: { connections: { data: [] } } })),
    enabled: false,
  });

  const _suspend = useMutation({
    mutationFn: (id: number) => adminService.suspendUser(id),
    onSuccess: () => {
      toast.success("User suspended");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const _unsuspend = useMutation({
    mutationFn: (id: number) => adminService.unsuspendUser(id),
    onSuccess: () => {
      toast.success("User reactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

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

        <div className="p-3 text-center text-sm text-zinc-500">
          <p className="py-10">
            User management requires a dedicated <code className="text-brand">/admin/users</code> Rails endpoint.<br />
            <span className="text-xs text-zinc-600 mt-1 block">
              Add <code className="text-zinc-400">GET /api/v1/admin/users</code> to the backend and wire it here.
            </span>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
