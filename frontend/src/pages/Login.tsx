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

const schema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const setAuth  = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const login = useMutation({
    mutationFn: (d: FormData) => authService.login(d),
    onSuccess: (res) => {
      const { user, access_token, refresh_token } = res.data;
      setAuth({ ...user.data.attributes, id: Number(user.data.id) }, access_token, refresh_token);
      const hasProfile = !!user.data.attributes.profile;
      navigate(hasProfile ? "/discover" : "/onboarding");
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      const msg = err.response?.data?.error || "Login failed";
      toast.error(msg);
    },
  });

  return (
    <div className="min-h-[100dvh] flex">
      <AuthHeroPanel
        illustration="/illustrations/login-hero.png"
        heading={<>Find your <span className="text-brand">person</span>,<br />not just a profile.</>}
        subtext="IntentConnect matches you with people who share your real intentions — from friendship to forever."
      >
        <div className="flex flex-wrap gap-2 justify-center max-w-xs">
          {["Serious Relationship", "Friendship", "Networking", "Marriage"].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full border border-brand/30 bg-brand/10 text-xs text-brand font-medium backdrop-blur-sm">
              {tag}
            </span>
          ))}
        </div>
      </AuthHeroPanel>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg px-4 sm:px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-sm">
          <AuthHeroMobile illustration="/illustrations/login-hero.png" />

          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-black text-brand tracking-tight">IntentConnect</h1>
            <p className="mt-1 text-xs text-zinc-500">Connect with purpose, not swipes.</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
            <p className="text-sm text-zinc-500 mb-6">Sign in to continue your journey.</p>

            <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                  <Link to="/forgot-password" className="text-xs text-brand hover:text-brand-light">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={login.isPending}
                className="w-full mt-2"
                size="lg"
              >
                {login.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand font-medium hover:text-brand-light">
                Create one
              </Link>
            </p>
          </div>

          {/* Dev hint */}
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400 space-y-0.5">
            <p className="font-medium">Seed accounts (password: password123)</p>
            <p className="text-amber-500/70">priya.sharma@seed.com · arjun.mehta@seed.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
