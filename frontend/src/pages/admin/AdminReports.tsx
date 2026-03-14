import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { XCircle, Ban } from "lucide-react";
import { adminService } from "../../services/admin.service";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import clsx from "clsx";

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

  const reports: any[] = data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-1">Reports</h1>
      <p className="text-sm text-zinc-500 mb-5">Review user safety reports</p>

      {/* Status tabs */}
      <div className="flex gap-1 bg-dark-surface border border-dark-border p-1 rounded-xl w-fit mb-6">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors",
              status === s ? "bg-brand text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="card p-5 animate-pulse space-y-2">
              <div className="h-5 bg-dark-hover rounded w-1/2" />
              <div className="h-4 bg-dark-hover rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && reports.length === 0 && (
        <div className="card p-10 text-center text-zinc-500 text-sm">
          No {status} reports.
        </div>
      )}

      <div className="space-y-3">
        {reports.map((r: any) => {
          const a = r.attributes;
          return (
            <div key={r.id} className="card p-5">
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
                    <span className="text-xs bg-rose-900/40 text-rose-400 border border-rose-800/40 px-2 py-0.5 rounded-full font-medium">
                      {a.reason.replace("_", " ")}
                    </span>
                  </div>
                  {a.details && (
                    <p className="text-sm text-zinc-400 bg-dark-hover rounded-xl px-3 py-2 mt-2 border border-dark-border">
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
                    <button
                      onClick={() => review.mutate({ id: Number(r.id), action: "reviewed" })}
                      disabled={review.isPending}
                      title="Suspend reported user"
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-900/40 text-rose-400 border border-rose-800/40 rounded-xl text-sm font-medium hover:bg-rose-900/60 transition-colors disabled:opacity-50"
                    >
                      <Ban size={14} /> Suspend
                    </button>
                    <button
                      onClick={() => review.mutate({ id: Number(r.id), action: "dismissed" })}
                      disabled={review.isPending}
                      title="Dismiss report"
                      className="flex items-center gap-1.5 px-3 py-2 bg-dark-hover text-zinc-400 border border-dark-border rounded-xl text-sm font-medium hover:text-white transition-colors disabled:opacity-50"
                    >
                      <XCircle size={14} /> Dismiss
                    </button>
                  </div>
                )}

                {status !== "open" && (
                  <span className={clsx(
                    "text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 border",
                    status === "reviewed"
                      ? "bg-rose-900/40 text-rose-400 border-rose-800/40"
                      : "bg-dark-hover text-zinc-500 border-dark-border"
                  )}>
                    {status === "reviewed" ? "User suspended" : "Dismissed"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
