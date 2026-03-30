import { api } from "../lib/api";

export const authService = {
  signup: (data: { email: string; phone: string; password: string }) =>
    api.post("/auth/signup", data),

  verifyOtp: (data: { phone: string; otp: string }) =>
    api.post("/auth/verify_otp", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  forgotPassword: (data: { phone: string }) =>
    api.post("/auth/forgot_password", data),

  resetPassword: (data: { phone: string; otp: string; password: string }) =>
    api.post("/auth/reset_password", data),

  logout: () => api.delete("/auth/logout"),
};
