import { api } from "../lib/api";

export const authService = {
  signup: (data: { email: string; phone: string; password: string }) =>
    api.post("/auth/signup", data),

  verifyOtp: (data: { phone: string; otp: string }) =>
    api.post("/auth/verify_otp", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => api.delete("/auth/logout"),
};
