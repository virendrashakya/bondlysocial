import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const REASONS = [
  { value: "harassment",     label: "Harassment or abuse" },
  { value: "fake_profile",   label: "Fake profile" },
  { value: "inappropriate",  label: "Inappropriate content" },
  { value: "spam",           label: "Spam" },
  { value: "other",          label: "Other" },
];

interface ReportModalProps {
  reportedUserId: number;
  reportedName: string;
  onClose: () => void;
}

export function ReportModal({ reportedUserId, reportedName, onClose }: ReportModalProps) {
  const [reason, setReason]   = useState("");
  const [details, setDetails] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      api.post("/reports", { reported_id: reportedUserId, reason, details }),
    onSuccess: () => {
      toast.success("Report submitted. We'll review it shortly.");
      onClose();
    },
    onError: () => toast.error("Failed to submit report. Please try again."),
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            <h2 className="font-semibold text-white">Report {reportedName}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Reason</label>
            {REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="accent-brand"
                />
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{r.label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-dark-border bg-dark-input px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-brand resize-none"
              placeholder="Describe what happened..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={() => submit.mutate()}
            disabled={!reason || submit.isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {submit.isPending ? "Submitting..." : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}
