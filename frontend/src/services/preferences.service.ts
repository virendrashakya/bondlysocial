import { api } from "@/lib/api";
import type { PrivacySettings, NotificationPreferences, DiscoveryPreferences } from "@/types";

export const preferencesService = {
  get: () => api.get("/preferences"),

  update: (data: { privacy?: Partial<PrivacySettings>; notifications?: Partial<NotificationPreferences>; discovery?: Partial<DiscoveryPreferences> }) =>
    api.patch("/preferences", data),
};
