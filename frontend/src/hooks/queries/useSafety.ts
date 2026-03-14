import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { safetyService } from "@/services/safety.service";
import { queryKeys } from "@/lib/queryKeys";
import type { BlockedUser } from "@/types";
import toast from "react-hot-toast";

/** Fetch current user's blocked list. */
export function useBlockedUsers() {
  return useQuery({
    queryKey: queryKeys.blocks.all,
    queryFn: () =>
      safetyService.getBlockedUsers().then((r) => (r.data.blocks ?? []) as BlockedUser[]),
  });
}

/** Mutation: block a user. */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockedId: number) => safetyService.block(blockedId),
    onSuccess: () => {
      toast.success("User blocked");
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestions.all });
    },
    onError: () => toast.error("Failed to block user"),
  });
}

/** Mutation: unblock a user. */
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockedId: number) => safetyService.unblock(blockedId),
    onSuccess: () => {
      toast.success("User unblocked");
      queryClient.invalidateQueries({ queryKey: queryKeys.blocks.all });
    },
    onError: () => toast.error("Failed to unblock user"),
  });
}

/** Mutation: report a user. */
export function useReportUser() {
  return useMutation({
    mutationFn: ({ reportedId, reason, details }: { reportedId: number; reason: string; details?: string }) =>
      safetyService.report(reportedId, reason, details),
    onSuccess: () => toast.success("Report submitted. Our team will review it within 24 hours."),
    onError: () => toast.error("Failed to submit report"),
  });
}
