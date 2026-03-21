export interface ReferencedPost {
  id: number;
  caption?: string;
  author_name: string;
  author_id: number;
  media_url?: string;
  media_type?: "image" | "video";
  media_count: number;
}

export interface MessageReaction {
  id: number;
  emoji: string;
  user_id: number;
  user_name?: string;
}

export interface MessageAttributes {
  body: string | null;
  read: boolean;
  created_at: string;
  sender_id: number;
  sender_name: string;
  image_url?: string;
  referenced_post?: ReferencedPost | null;
  message_type: "text" | "image" | "image_with_text" | "post_share" | "post_share_with_text";
  pinned: boolean;
  pinned_at?: string | null;
  reactions: MessageReaction[];
}

export interface BlockedUser {
  id: number;
  blocked_id: number;
  blocked_name: string;
  blocked_avatar_url?: string;
  created_at: string;
}

export interface PrivacySettings {
  hidden: boolean;
  show_online: boolean;
  show_last_seen: boolean;
  allow_messages: boolean;
  show_photos_to: "all" | "connections" | "verified";
  searchable: boolean;
  show_distance: boolean;
}

export interface NotificationPreferences {
  connection_requests: boolean;
  messages: boolean;
  group_activity: boolean;
  match_alerts: boolean;
  weekly_digest: boolean;
}

export interface UserPreferences {
  privacy: PrivacySettings;
  notifications: NotificationPreferences;
}
