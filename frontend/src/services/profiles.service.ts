import { api } from "../lib/api";

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

  uploadSelfie: (file: File) => {
    const form = new FormData();
    form.append("selfie", file);
    return api.post("/profiles/me/selfie", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export interface Profile {
  id: number;
  name: string;
  age: number;
  gender: string;
  city: string;
  occupation?: string;
  bio?: string;
  intent: string;
  interests: string[];
  avatar_url?: string;
  verified: boolean;
  hidden: boolean;

  // Cultural / Identity
  cultural_background?: string;
  cultural_background_custom?: string;
  religion?: string;
  religion_visibility?: string;
  languages_spoken?: string[];

  // Physical Appearance
  height_cm?: number;
  body_type?: string;
  appearance_tags?: string[];

  // Lifestyle
  drinking?: string;
  smoking?: string;
  workout_frequency?: string;
  relationship_status?: string;

  // Privacy Controls
  show_height?: boolean;
  show_body_type?: boolean;
  show_online_status?: boolean;
}
