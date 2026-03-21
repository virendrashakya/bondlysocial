import { api } from "../lib/api";
import type { PrivacySettings, NotificationPreferences } from "@/types";

export const preferencesService = {
  get: () => api.get("/preferences"),
  update: (data: { privacy?: Partial<PrivacySettings>; notifications?: Partial<NotificationPreferences> }) =>
    api.patch("/preferences", data),
};
