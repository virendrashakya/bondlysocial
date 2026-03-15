import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
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
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand">IntentConnect</h1>
          <p className="mt-1 text-sm text-zinc-500">Connect with purpose, not swipes.</p>
        </div>

        <GlassCard padding="lg">
          <h2 className="text-xl font-semibold text-white mb-6">Welcome back</h2>

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
              <Label>Password</Label>
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
            >
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-brand font-medium hover:text-brand-light">
              Create one
            </Link>
          </p>
        </GlassCard>

        {/* Dev hint */}
        <GlassCard variant="brand" padding="sm" className="mt-4 text-xs text-amber-400 space-y-1">
          <p className="font-medium">Seed accounts (password: password123)</p>
          <p>priya.sharma@seed.com · arjun.mehta@seed.com · sneha.iyer@seed.com</p>
        </GlassCard>
      </div>
    </div>
  );
}
