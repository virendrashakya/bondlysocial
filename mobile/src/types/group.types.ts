export interface GroupAttributes {
  title: string;
  description?: string;
  city: string;
  category?: string;
  max_members: number;
  members_count: number;
  is_member: boolean;
  creator_name?: string;
  status: string;
  created_at: string;
  members: GroupMember[];
}

export interface GroupMember {
  id: number;
  name: string;
  avatar_url?: string;
  city?: string;
  interests: string[];
  intent?: string;
  role: "member" | "admin";
  joined_at: string;
}

export interface GroupMessage {
  id: number;
  body: string;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  created_at: string;
}
