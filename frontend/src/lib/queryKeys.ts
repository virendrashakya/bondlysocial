/**
 * Centralised query-key factory.
 *
 * Using a factory keeps keys consistent across components and makes
 * targeted invalidation trivial (e.g. `queryKeys.messages.list(id)`).
 *
 * Pattern: each domain exposes `all` (broadest) → more specific keys,
 * so `queryClient.invalidateQueries({ queryKey: queryKeys.messages.all })`
 * clears everything under that namespace.
 */
export const queryKeys = {
  // ── Profiles ────────────────────────────────────────────────
  profiles: {
    all: ["profiles"] as const,
    me: () => [...queryKeys.profiles.all, "me"] as const,
    detail: (userId: number) => [...queryKeys.profiles.all, userId] as const,
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

  // ── App Config ──────────────────────────────────────────────
  appConfig: {
    all: ["app-config"] as const,
  },
} as const;
