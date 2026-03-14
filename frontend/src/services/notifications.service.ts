import { api } from "../lib/api";

export const notificationsService = {
  getAll:      ()         => api.get("/notifications"),
  markRead:    (id: number) => api.patch(`/notifications/${id}/mark_read`),
  markAllRead: ()         => api.patch("/notifications/read_all"),
};
