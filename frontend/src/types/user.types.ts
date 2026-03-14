/** Minimal user object stored in auth state (from JWT / login response). */
export interface AuthUser {
  id: number;
  email: string;
  phone: string;
  role: string;
  status: string;
  phone_verified: boolean;
  selfie_verified: boolean;
  profile?: {
    name: string;
    city: string;
    intent: string;
  };
}

/** Full profile returned from GET /profiles/:id */
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

/** Profile augmented with match data — returned from GET /profiles/suggestions */
export interface SuggestionProfile extends Profile {
  match_score?: number;
  last_seen_at?: string;
}
