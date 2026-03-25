import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profilesService } from "@/services/profiles.service";
import { connectionsService } from "@/services/connections.service";
import { queryKeys } from "@/lib/queryKeys";
import type { JsonApiResource, SuggestionProfile } from "@/types";
import toast from "react-hot-toast";

/** Fetch discovery suggestions. */
export function useSuggestions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.suggestions.all,
    queryFn: () =>
      profilesService
        .getSuggestions()
        .then((r) => (r.data.profiles?.data ?? []) as JsonApiResource<SuggestionProfile>[]),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}

/** Mutation: send a connection request from the discover page. */
export function useConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiverId: number) => connectionsService.create(receiverId),
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestions.all });
    },
    onError: () => toast.error("Could not send request. Try again."),
  });
}

/** Mutation: pass / dislike a profile from the discover page. */
export function usePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiverId: number) => connectionsService.pass(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestions.all });
    },
  });
}
