import { api } from "../lib/api";

export const groupsService = {
  getAll:  (city?: string) => api.get("/groups", { params: city ? { city } : {} }),
  getOne:  (id: number)    => api.get(`/groups/${id}`),
  create:  (data: { title: string; description?: string; city: string; category?: string; max_members: number }) =>
    api.post("/groups", { group: data }),
  join:    (id: number)    => api.post(`/groups/${id}/join`),
  leave:   (id: number)    => api.delete(`/groups/${id}/leave`),
  getMessages:  (id: number)    => api.get(`/groups/${id}/messages`),
  sendMessage:  (id: number, body: string) => api.post(`/groups/${id}/messages`, { body }),
};
