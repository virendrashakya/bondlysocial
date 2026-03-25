import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { preferencesService } from "@/services/preferences.service";
import { queryKeys } from "@/lib/queryKeys";
import type { UserPreferences, PrivacySettings, NotificationPreferences, DiscoveryPreferences } from "@/types";
import toast from "react-hot-toast";

/** Fetch user preferences (privacy + notifications + discovery). */
export function usePreferences() {
  return useQuery({
    queryKey: queryKeys.preferences.all,
    queryFn: () =>
      preferencesService.get().then((r) => r.data as UserPreferences),
  });
}

/** Mutation: update privacy settings. */
export function useUpdatePrivacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (privacy: Partial<PrivacySettings>) =>
      preferencesService.update({ privacy }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.all });
      toast.success("Privacy settings saved");
    },
    onError: () => toast.error("Failed to save privacy settings"),
  });
}

/** Mutation: update notification preferences. */
export function useUpdateNotificationPrefs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notifications: Partial<NotificationPreferences>) =>
      preferencesService.update({ notifications }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.all });
      toast.success("Notification preferences saved");
    },
    onError: () => toast.error("Failed to save notification preferences"),
  });
}

/** Mutation: update discovery preferences. */
export function useUpdateDiscoveryPrefs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discovery: Partial<DiscoveryPreferences>) =>
      preferencesService.update({ discovery }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestions.all });
      toast.success("Discovery preferences saved");
    },
    onError: () => toast.error("Failed to save discovery preferences"),
  });
}
