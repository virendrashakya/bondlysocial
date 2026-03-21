import { api } from "../lib/api";

export const safetyService = {
  report: (reported_id: number, reason: string, details?: string) =>
    api.post("/reports", { reported_id, reason, details }),
  block: (blocked_id: number) => api.post("/blocks", { blocked_id }),
  unblock: (blocked_id: number) => api.delete(`/blocks/${blocked_id}`),
  getBlockedUsers: () => api.get("/blocks"),
};
