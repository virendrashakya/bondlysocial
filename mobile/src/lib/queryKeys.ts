export const queryKeys = {
  profiles: {
    all: ["profiles"] as const,
    me: () => [...queryKeys.profiles.all, "me"] as const,
    detail: (userId: number) => [...queryKeys.profiles.all, userId] as const,
    search: (params: Record<string, string | string[] | undefined>) => [...queryKeys.profiles.all, "search", params] as const,
  },
  suggestions: {
    all: ["suggestions"] as const,
  },
  connections: {
    all: ["connections"] as const,
    requests: () => [...queryKeys.connections.all, "requests"] as const,
  },
  messages: {
    all: ["messages"] as const,
    list: (connectionId: number) => [...queryKeys.messages.all, connectionId] as const,
    preview: (connectionId: number) => [...queryKeys.messages.all, "preview", connectionId] as const,
    pinned: (connectionId: number) => [...queryKeys.messages.all, "pinned", connectionId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    count: () => [...queryKeys.notifications.all, "count"] as const,
  },
  posts: {
    all: ["posts"] as const,
    list: (userId?: number) => [...queryKeys.posts.all, userId] as const,
  },
  groups: {
    all: ["groups"] as const,
    detail: (id: number) => [...queryKeys.groups.all, id] as const,
  },
  blocks: {
    all: ["blocks"] as const,
  },
  preferences: {
    all: ["preferences"] as const,
  },
  appConfig: {
    all: ["app-config"] as const,
  },
} as const;
