/** Referenced post embedded inside a message (when a user shares a post in chat). */
export interface ReferencedPost {
  id: number;
  caption?: string;
  author_name: string;
  author_id: number;
  media_url?: string;
  media_type?: "image" | "video";
  media_count: number;
}

/** Attributes of a message resource (JSONAPI). */
export interface MessageAttributes {
  body: string | null;
  read: boolean;
  created_at: string;
  sender_id: number;
  sender_name: string;
  image_url?: string;
  referenced_post?: ReferencedPost | null;
  message_type: "text" | "image" | "image_with_text" | "post_share" | "post_share_with_text";
}
