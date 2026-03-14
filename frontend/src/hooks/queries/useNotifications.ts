import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";
import { queryKeys } from "@/lib/queryKeys";
import type { JsonApiResource, NotificationAttributes } from "@/types";

/** Fetch all notifications + unread count. */
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () =>
      notificationsService.getAll().then((r) => ({
        notifications: (r.data.notifications?.data ?? []) as JsonApiResource<NotificationAttributes>[],
        unreadCount: (r.data.unread_count ?? 0) as number,
      })),
  });
}

/** Mutation: mark a single notification as read. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationsService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.count() });
    },
  });
}

/** Mutation: mark all notifications as read. */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.count() });
    },
  });
}
