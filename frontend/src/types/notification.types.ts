/** Attributes of a notification resource (JSONAPI). */
export interface NotificationAttributes {
  kind: string;
  title: string;
  body?: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, number | string>;
}
