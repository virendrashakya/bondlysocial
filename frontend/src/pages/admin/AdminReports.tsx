import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { XCircle, Ban } from "lucide-react";
import { adminService } from "../../services/admin.service";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { JsonApiResource } from "@/types";

interface ReportAttributes {
  reporter_id: number;
  reported_id: number;
  reporter_name?: string;
  reported_name?: string;
  reason: string;
  details?: string;
  status: string;
  created_at: string;
}

const STATUS_TABS = ["open", "reviewed", "dismissed"] as const;

export function AdminReportsPage() {
  const [status, setStatus] = useState<"open" | "reviewed" | "dismissed">("open");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", status],
    queryFn:  () => adminService.getReports(status).then((r) => r.data.reports?.data ?? []),
  });

  const review = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "reviewed" | "dismissed" }) =>
      adminService.reviewReport(id, action),
    onSuccess: (_, { action }) => {
      toast.success(action === "reviewed" ? "User suspended & report resolved" : "Report dismissed");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });

  const reports: JsonApiResource<ReportAttributes>[] = data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-1">Reports</h1>
      <p className="text-sm text-zinc-500 mb-5">Review user safety reports</p>

      {/* Status tabs */}
      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)} className="mb-6">
        <TabsList className="w-fit">
          {STATUS_TABS.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <GlassCard key={i} className="animate-pulse space-y-2">
              <div className="h-5 bg-white/[0.06] rounded w-1/2" />
              <div className="h-4 bg-white/[0.06] rounded w-1/3" />
            </GlassCard>
          ))}
        </div>
      )}

      {!isLoading && reports.length === 0 && (
        <GlassCard className="text-center text-zinc-500 text-sm py-10">
          No {status} reports.
        </GlassCard>
      )}

      <div className="space-y-3">
        {reports.map((r: JsonApiResource<ReportAttributes>) => {
          const a = r.attributes;
          return (
            <GlassCard key={r.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">
                      Reporter #{a.reporter_id}
                    </span>
                    <span className="text-zinc-500 text-xs">→</span>
                    <span className="text-sm font-semibold text-white">
                      Reported #{a.reported_id}
                    </span>
                    <Badge variant="danger" size="sm">
                      {a.reason.replace("_", " ")}
                    </Badge>
                  </div>
                  {a.details && (
                    <p className="text-sm text-zinc-400 bg-white/[0.03] rounded-xl px-3 py-2 mt-2 border border-white/[0.06]">
                      "{a.details}"
                    </p>
                  )}
                  <p className="text-xs text-zinc-600">
                    Reported {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </p>
                </div>

                {/* Actions */}
                {status === "open" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => review.mutate({ id: Number(r.id), action: "reviewed" })}
                      disabled={review.isPending}
                    >
                      <Ban size={14} /> Suspend
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => review.mutate({ id: Number(r.id), action: "dismissed" })}
                      disabled={review.isPending}
                    >
                      <XCircle size={14} /> Dismiss
                    </Button>
                  </div>
                )}

                {status !== "open" && (
                  <Badge variant={status === "reviewed" ? "danger" : "default"} size="sm">
                    {status === "reviewed" ? "User suspended" : "Dismissed"}
                  </Badge>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
