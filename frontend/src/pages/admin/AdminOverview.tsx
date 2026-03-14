import { useQuery } from "@tanstack/react-query";
import { Users, Flag, UserCheck, Layers } from "lucide-react";
import { adminService } from "../../services/admin.service";
import { api } from "../../lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
  return (
    <GlassCard className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-zinc-500">{label}</p>
      </div>
    </GlassCard>
  );
}

export function AdminOverviewPage() {
  const { data: reports } = useQuery({
    queryKey: ["admin-reports-open"],
    queryFn:  () => adminService.getReports("open").then((r) => r.data.reports?.data ?? []),
  });

  const { data: _notifs } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn:  () => api.get("/notifications").then((r) => r.data),
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Platform health overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Flag}      label="Open reports"    value={reports?.length ?? 0} color="text-rose-400 bg-rose-900/30 border border-rose-800/30" />
        <StatCard icon={UserCheck} label="Pending reviews"  value="—"                   color="text-amber-400 bg-amber-900/30 border border-amber-800/30" />
        <StatCard icon={Users}     label="Active users"     value="—"                   color="text-brand bg-brand-muted border border-brand-border" />
        <StatCard icon={Layers}    label="Groups"           value="—"                   color="text-violet-400 bg-violet-900/30 border border-violet-800/30" />
      </div>

      {/* Recent open reports preview */}
      <GlassCard padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent open reports</h2>
          <a href="/admin/reports" className="text-sm text-brand hover:text-brand-light transition-colors">View all</a>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {(!reports || reports.length === 0) && (
            <div className="px-5 py-8 text-center text-sm text-zinc-500">
              No open reports. Platform is clean.
            </div>
          )}
          {(reports ?? []).slice(0, 5).map((r: any) => (
            <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
              <div>
                <span className="text-sm font-medium text-white">
                  {r.attributes.reporter_name ?? `User #${r.attributes.reporter_id}`}
                </span>
                <span className="text-sm text-zinc-500"> reported </span>
                <span className="text-sm font-medium text-white">
                  {r.attributes.reported_name ?? `User #${r.attributes.reported_id}`}
                </span>
                <Badge variant="danger" size="sm" className="ml-2">
                  {r.attributes.reason}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
