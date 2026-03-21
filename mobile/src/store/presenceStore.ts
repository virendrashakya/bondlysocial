import { create } from "zustand";

interface PresenceState {
  onlineUsers: Set<number>;
  lastActiveMap: Record<number, string>;
  setOnline: (userId: number) => void;
  setOffline: (userId: number) => void;
  updateLastActive: (userId: number, ts: string) => void;
  isOnline: (userId: number) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: new Set(),
  lastActiveMap: {},

  setOnline: (userId) =>
    set((s) => {
      const next = new Set(s.onlineUsers);
      next.add(userId);
      return { onlineUsers: next };
    }),

  setOffline: (userId) =>
    set((s) => {
      const next = new Set(s.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),

  updateLastActive: (userId, ts) =>
    set((s) => ({
      lastActiveMap: { ...s.lastActiveMap, [userId]: ts },
    })),

  isOnline: (userId) => get().onlineUsers.has(userId),
}));
