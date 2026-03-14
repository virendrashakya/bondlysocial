import { api } from "../lib/api";

export const adminService = {
  getReports:   (status?: string) =>
    api.get("/admin/reports", { params: status ? { status } : {} }),
  reviewReport: (id: number, action: "reviewed" | "dismissed") =>
    api.patch(`/admin/reports/${id}/review`, { action_taken: action }),
  suspendUser:  (id: number) => api.patch(`/admin/users/${id}/suspend`),
  unsuspendUser:(id: number) => api.patch(`/admin/users/${id}/unsuspend`),
};
