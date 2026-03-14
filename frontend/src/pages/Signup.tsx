import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const signupSchema = z.object({
  email:    z.string().email("Invalid email"),
  phone:    z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});

type SignupForm = z.infer<typeof signupSchema>;
type OtpForm   = z.infer<typeof otpSchema>;

export function SignupPage() {
  const [step, setStep]   = useState<"signup" | "otp">("signup");
  const [phone, setPhone] = useState("");
  const setAuth           = useAuthStore((s) => s.setAuth);
  const navigate          = useNavigate();

  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });
  const otpForm    = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (_, vars) => {
      setPhone(vars.phone);
      setStep("otp");
      toast.success("OTP sent to your phone");
    },
    onError: () => toast.error("Signup failed. Please try again."),
  });

  const verifyMutation = useMutation({
    mutationFn: (otp: string) => authService.verifyOtp({ phone, otp }),
    onSuccess: (res) => {
      setAuth(res.data.user.data.attributes, res.data.access_token, res.data.refresh_token);
      navigate("/onboarding");
    },
    onError: () => toast.error("Invalid or expired OTP"),
  });

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white">Verify your phone</h1>
          <p className="mt-1 text-sm text-zinc-500">We sent a 6-digit code to {phone}</p>

          <form
            onSubmit={otpForm.handleSubmit((d) => verifyMutation.mutate(d.otp))}
            className="mt-6 space-y-4"
          >
            <input
              {...otpForm.register("otp")}
              placeholder="Enter OTP"
              maxLength={6}
              className="w-full rounded-xl border border-dark-border bg-dark-input px-4 py-3 text-center text-xl tracking-widest text-white outline-none focus:border-brand"
            />
            {otpForm.formState.errors.otp && (
              <p className="text-xs text-red-400">{otpForm.formState.errors.otp.message}</p>
            )}
            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className="btn-primary w-full py-3"
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-500">Connect with purpose, not swipes.</p>

        <form
          onSubmit={signupForm.handleSubmit((d) => signupMutation.mutate(d))}
          className="mt-6 space-y-4"
        >
          {(["email", "phone", "password"] as const).map((field) => (
            <div key={field} className="space-y-1">
              <label className="text-sm font-medium text-zinc-300 capitalize">{field}</label>
              <input
                {...signupForm.register(field)}
                type={field === "password" ? "password" : "text"}
                placeholder={field === "phone" ? "+91 9999999999" : `Your ${field}`}
                className="input"
              />
              {signupForm.formState.errors[field] && (
                <p className="text-xs text-red-400">
                  {signupForm.formState.errors[field]?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="btn-primary w-full py-3"
          >
            {signupMutation.isPending ? "Creating account..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
