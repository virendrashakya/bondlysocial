export interface MediaItem {
  url: string;
  type: "image" | "video";
  id: number;
}

export interface Post {
  id: number;
  author_name: string;
  author_avatar?: string;
  author_id: number;
  caption?: string;
  media: MediaItem[];
  media_url?: string;
  media_type?: "image" | "video";
  media_count: number;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  is_own: boolean;
  visibility: "public" | "connections";
  location?: string;
  created_at: string;
}
