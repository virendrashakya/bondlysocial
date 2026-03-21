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
  cultural_background?: string;
  cultural_background_custom?: string;
  religion?: string;
  religion_visibility?: string;
  languages_spoken?: string[];
  height_cm?: number;
  body_type?: string;
  appearance_tags?: string[];
  drinking?: string;
  smoking?: string;
  workout_frequency?: string;
  relationship_status?: string;
  show_height?: boolean;
  show_body_type?: boolean;
  show_online_status?: boolean;
}

export interface SuggestionProfile extends Profile {
  match_score?: number;
  last_seen_at?: string;
}
