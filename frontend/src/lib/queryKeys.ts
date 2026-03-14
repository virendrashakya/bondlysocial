/**
 * Centralised query-key factory.
 */
export const queryKeys = {
  // ── Profiles ────────────────────────────────────────────────
  profiles: {
    all: ["profiles"] as const,
    me: () => [...queryKeys.profiles.all, "me"] as const,
    detail: (userId: number) => [...queryKeys.profiles.all, userId] as const,
    search: (params: Record<string, string | string[] | undefined>) => [...queryKeys.profiles.all, "search", params] as const,
  },

  // ── Suggestions (Discover) ─────────────────────────────────
  suggestions: {
    all: ["suggestions"] as const,
  },

  // ── Connections ─────────────────────────────────────────────
  connections: {
    all: ["connections"] as const,
    requests: () => [...queryKeys.connections.all, "requests"] as const,
  },

  // ── Messages ────────────────────────────────────────────────
  messages: {
    all: ["messages"] as const,
    list: (connectionId: number) => [...queryKeys.messages.all, connectionId] as const,
    preview: (connectionId: number) => [...queryKeys.messages.all, "preview", connectionId] as const,
    pinned: (connectionId: number) => [...queryKeys.messages.all, "pinned", connectionId] as const,
  },

  // ── Notifications ───────────────────────────────────────────
  notifications: {
    all: ["notifications"] as const,
    count: () => [...queryKeys.notifications.all, "count"] as const,
  },

  // ── Posts ────────────────────────────────────────────────────
  posts: {
    all: ["posts"] as const,
    list: (userId?: number) => [...queryKeys.posts.all, userId] as const,
  },

  // ── Groups ──────────────────────────────────────────────────
  groups: {
    all: ["groups"] as const,
    detail: (id: number) => [...queryKeys.groups.all, id] as const,
  },

  // ── Safety (blocks) ────────────────────────────────────────
  blocks: {
    all: ["blocks"] as const,
  },

  // ── Preferences ────────────────────────────────────────────
  preferences: {
    all: ["preferences"] as const,
  },

  // ── Admin ─────────────────────────────────────────────────
  admin: {
    users: (params?: Record<string, string | number | undefined>) => ["admin", "users", params] as const,
    stats: () => ["admin", "stats"] as const,
    reports: (status?: string) => ["admin", "reports", status] as const,
  },

  // ── App Config ──────────────────────────────────────────────
  appConfig: {
    all: ["app-config"] as const,
  },
} as const;
