/** The "other user" object embedded inside a connection resource. */
export interface OtherUser {
  user_id: number;
  name: string;
  avatar_url?: string;
  city?: string;
  intent?: string;
  verified?: boolean;
}

/** Attributes of a connection resource (JSONAPI). */
export interface ConnectionAttributes {
  status: string;
  created_at: string;
  other_user: OtherUser;
}
