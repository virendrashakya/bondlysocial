export interface OtherUser {
  id: number;
  name: string;
  avatar_url?: string;
  city?: string;
  intent?: string;
  verified?: boolean;
}

export interface ConnectionAttributes {
  status: string;
  created_at: string;
  other_user: OtherUser;
}
