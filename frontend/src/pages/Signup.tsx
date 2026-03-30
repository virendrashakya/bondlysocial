import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { AuthHeroPanel, AuthHeroMobile } from "@/components/auth/AuthHeroPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const signupSchema = z.object({
  email:    z.string().email("Invalid email"),
  phone:    z.string().min(8, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});

type SignupForm = z.infer<typeof signupSchema>;
type OtpForm   = z.infer<typeof otpSchema>;

function normalizePhone(raw: string) {
  return raw.replace(/[\s\-\(\)]/g, "");
}

export function SignupPage() {
  const [step, setStep]   = useState<"signup" | "otp">("signup");
  const [phone, setPhone] = useState("");
  const setAuth           = useAuthStore((s) => s.setAuth);
  const navigate          = useNavigate();

  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });
  const otpForm    = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  const signupMutation = useMutation({
    mutationFn: (vars: SignupForm) =>
      authService.signup({ ...vars, phone: normalizePhone(vars.phone) }),
    onSuccess: (_, vars) => {
      setPhone(normalizePhone(vars.phone));
      setStep("otp");
      toast.success("OTP sent to your phone");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.errors?.[0] || "Signup failed. Please try again.";
      toast.error(msg);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (otp: string) => authService.verifyOtp({ phone, otp }),
    onSuccess: (res) => {
      setAuth({ ...res.data.user.data.attributes, id: Number(res.data.user.data.id) }, res.data.access_token, res.data.refresh_token);
      navigate("/onboarding");
    },
    onError: () => toast.error("Invalid or expired OTP"),
  });

  /* ── OTP step ── */
  if (step === "otp") {
    return (
      <div className="min-h-[100dvh] flex">
        <AuthHeroPanel
          illustration="/illustrations/signup-hero.png"
          heading="Almost there!"
          subtext="One last step — verify your phone to keep your account secure."
        />

        <div className="flex-1 flex items-center justify-center bg-dark-bg px-4 sm:px-8 py-10">
          <div className="w-full max-w-sm">
            <AuthHeroMobile illustration="/illustrations/signup-hero.png" />

            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <i className="fa-solid fa-mobile-screen-button text-brand text-sm" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Verify your phone</h1>
                  <p className="text-xs text-zinc-500">Code sent to {phone}</p>
                </div>
              </div>

              <form
                onSubmit={otpForm.handleSubmit((d) => verifyMutation.mutate(d.otp))}
                className="mt-6 space-y-4"
              >
                <div className="space-y-1">
                  <Label>6-digit code</Label>
                  <Input
                    {...otpForm.register("otp")}
                    placeholder="------"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-xs text-red-400">{otpForm.formState.errors.otp.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={verifyMutation.isPending} className="w-full" size="lg">
                  {verifyMutation.isPending ? "Verifying..." : "Verify & Continue"}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-zinc-600">
                Didn't get the code?{" "}
                <button type="button" className="text-brand hover:underline" onClick={() => setStep("signup")}>
                  Go back
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Signup step ── */
  return (
    <div className="min-h-[100dvh] flex">
      <AuthHeroPanel
        illustration="/illustrations/signup-hero.png"
        heading={<>Your story starts<br /><span className="text-brand">right here.</span></>}
        subtext="Create your profile in minutes and start connecting with people who truly get you."
      >
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-black text-brand">10k+</p>
            <p className="text-xs text-zinc-500">Active users</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-black text-brand">94%</p>
            <p className="text-xs text-zinc-500">Match quality</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-black text-brand">4.8</p>
            <p className="text-xs text-zinc-500">Avg rating</p>
          </div>
        </div>
      </AuthHeroPanel>

      <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg px-4 sm:px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-sm">
          <AuthHeroMobile illustration="/illustrations/signup-hero.png" />

          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-black text-brand tracking-tight">IntentConnect</h1>
            <p className="mt-1 text-xs text-zinc-500">Connect with purpose, not swipes.</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-1">Create your account</h2>
            <p className="text-sm text-zinc-500 mb-6">Takes less than a minute.</p>

            <form
              onSubmit={signupForm.handleSubmit((d) => signupMutation.mutate(d))}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  {...signupForm.register("email")}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-red-400">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Phone number</Label>
                <Input
                  {...signupForm.register("phone")}
                  type="tel"
                  placeholder="+919999999999"
                  autoComplete="tel"
                />
                {signupForm.formState.errors.phone && (
                  <p className="text-xs text-red-400">{signupForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Password</Label>
                <Input
                  {...signupForm.register("password")}
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-red-400">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full mt-2"
                size="lg"
              >
                {signupMutation.isPending ? "Creating account..." : "Continue"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link to="/login" className="text-brand font-medium hover:text-brand-light">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-600 leading-relaxed px-2">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
