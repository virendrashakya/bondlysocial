import { api } from "../lib/api";

export const connectionsService = {
  getAll:    ()         => api.get("/connections"),
  getRequests: ()       => api.get("/connections/requests"),
  getSent:   ()         => api.get("/connections/sent"),
  create:    (receiverId: number) => api.post("/connections", { receiver_id: receiverId }),
  pass:      (receiverId: number) => api.post("/connections", { receiver_id: receiverId, status: "rejected" }),
  accept:    (id: number) => api.post(`/connections/${id}/accept`),
  reject:    (id: number) => api.post(`/connections/${id}/reject`),
  cancelSent:(id: number) => api.delete(`/connections/${id}/cancel`),
};
