/** Attributes of a group resource (JSONAPI). */
export interface GroupAttributes {
  title: string;
  description?: string;
  city: string;
  max_members: number;
  members_count: number;
  is_member: boolean;
  created_at: string;
}
