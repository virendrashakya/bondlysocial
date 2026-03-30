import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { AuthHeroPanel, AuthHeroMobile } from "@/components/auth/AuthHeroPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const phoneSchema = z.object({
  phone: z.string().min(8, "Enter a valid phone number"),
});

const resetSchema = z.object({
  otp:      z.string().length(6, "Enter the 6-digit code"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type ResetForm = z.infer<typeof resetSchema>;

function normalizePhone(raw: string) {
  return raw.replace(/[\s\-\(\)]/g, "");
}

export function ForgotPasswordPage() {
  const [step, setStep]   = useState<"phone" | "reset">("phone");
  const [phone, setPhone] = useState("");
  const setAuth           = useAuthStore((s) => s.setAuth);
  const navigate          = useNavigate();

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const sendOtp = useMutation({
    mutationFn: (vars: PhoneForm) =>
      authService.forgotPassword({ phone: normalizePhone(vars.phone) }),
    onSuccess: (_, vars) => {
      setPhone(normalizePhone(vars.phone));
      setStep("reset");
      toast.success("OTP sent to your phone");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || "Phone number not found.";
      toast.error(msg);
    },
  });

  const resetPassword = useMutation({
    mutationFn: (data: { otp: string; password: string }) =>
      authService.resetPassword({ phone, ...data }),
    onSuccess: (res) => {
      setAuth(
        { ...res.data.user.data.attributes, id: Number(res.data.user.data.id) },
        res.data.access_token,
        res.data.refresh_token
      );
      toast.success("Password reset successful!");
      const hasProfile = !!res.data.user.data.attributes.profile;
      navigate(hasProfile ? "/discover" : "/onboarding");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || "Reset failed.";
      toast.error(msg);
    },
  });

  const heroPanel = (
    <AuthHeroPanel
      illustration="/illustrations/forgot-hero.png"
      heading={<>Locked out? <span className="text-brand">No worries.</span></>}
      subtext="We'll send a quick verification code to your registered phone number to get you back in."
    >
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3 backdrop-blur-sm">
        <i className="fa-solid fa-shield-halved text-brand text-lg" />
        <p className="text-xs text-zinc-400">Your account is protected with OTP verification.</p>
      </div>
    </AuthHeroPanel>
  );

  /* ── Reset password step ── */
  if (step === "reset") {
    return (
      <div className="min-h-[100dvh] flex">
        {heroPanel}

        <div className="flex-1 flex items-center justify-center bg-dark-bg px-4 sm:px-8 py-10">
          <div className="w-full max-w-sm">
            <AuthHeroMobile illustration="/illustrations/forgot-hero.png" />

            <div className="mb-6">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors">
                <i className="fa-solid fa-arrow-left text-[10px]" /> Back to sign in
              </Link>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <i className="fa-solid fa-key text-brand text-sm" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Reset password</h1>
                  <p className="text-xs text-zinc-500">Code sent to {phone}</p>
                </div>
              </div>

              <form
                onSubmit={resetForm.handleSubmit((d) => resetPassword.mutate(d))}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label>OTP Code</Label>
                  <Input
                    {...resetForm.register("otp")}
                    placeholder="------"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                  />
                  {resetForm.formState.errors.otp && (
                    <p className="text-xs text-red-400">{resetForm.formState.errors.otp.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>New Password</Label>
                  <Input
                    {...resetForm.register("password")}
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  {resetForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{resetForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={resetPassword.isPending} className="w-full" size="lg">
                  {resetPassword.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-zinc-600">
                <button onClick={() => setStep("phone")} className="text-brand hover:underline">
                  Use a different number
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Phone step ── */
  return (
    <div className="min-h-[100dvh] flex">
      {heroPanel}

      <div className="flex-1 flex items-center justify-center bg-dark-bg px-4 sm:px-8 py-10">
        <div className="w-full max-w-sm">
          <AuthHeroMobile illustration="/illustrations/forgot-hero.png" />

          <div className="mb-6">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors">
              <i className="fa-solid fa-arrow-left text-[10px]" /> Back to sign in
            </Link>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <i className="fa-solid fa-lock text-brand text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-white">Forgot password?</h1>
            </div>
            <p className="text-sm text-zinc-500 mt-2 mb-6">
              Enter your registered phone number — we'll send a reset code.
            </p>

            <form
              onSubmit={phoneForm.handleSubmit((d) => sendOtp.mutate(d))}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label>Phone number</Label>
                <Input
                  {...phoneForm.register("phone")}
                  type="tel"
                  placeholder="+919999999999"
                  autoComplete="tel"
                />
                {phoneForm.formState.errors.phone && (
                  <p className="text-xs text-red-400">{phoneForm.formState.errors.phone.message}</p>
                )}
              </div>

              <Button type="submit" disabled={sendOtp.isPending} className="w-full" size="lg">
                {sendOtp.isPending ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-zinc-500">
              Remember your password?{" "}
              <Link to="/login" className="text-brand font-medium hover:text-brand-light">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
