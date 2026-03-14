import { api } from "../lib/api";

export const connectionsService = {
  getAll:    ()         => api.get("/connections"),
  getRequests: ()       => api.get("/connections/requests"),
  create:    (receiverId: number) => api.post("/connections", { receiver_id: receiverId }),
  accept:    (id: number) => api.post(`/connections/${id}/accept`),
  reject:    (id: number) => api.post(`/connections/${id}/reject`),
};
