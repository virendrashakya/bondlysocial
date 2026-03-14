import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            <DialogTitle>Report {reportedName}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
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
            <Label>Additional details (optional)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Describe what happened..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => submit.mutate()}
            disabled={!reason || submit.isPending}
          >
            {submit.isPending ? "Submitting..." : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
