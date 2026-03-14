import { api } from "@/lib/api";
import type { Profile } from "@/types";

// Re-export so existing `import { Profile } from "@/services/profiles.service"` still works.
export type { Profile } from "@/types";

export const profilesService = {
  getSuggestions: () =>
    api.get("/profiles/suggestions"),

  getProfile: (userId: number) =>
    api.get(`/profiles/${userId}`),

  createProfile: (data: Partial<Profile>) =>
    api.post("/profiles", { profile: data }),

  updateProfile: (data: Partial<Profile>) =>
    api.patch("/profiles/me", { profile: data }),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.post("/profiles/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  searchProfiles: (params: { q?: string; intent?: string; city?: string; interests?: string[] }) =>
    api.get("/profiles/search", { params }),

  uploadSelfie: (file: File) => {
    const form = new FormData();
    form.append("selfie", file);
    return api.post("/profiles/me/selfie", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
