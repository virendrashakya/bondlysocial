import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, CheckCircle2, Crown, Eye, Zap, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

const PERKS = [
  { icon: Eye,   label: "Unlimited Profile Views" },
  { icon: Zap,   label: "Priority in Discovery" },
  { icon: Heart, label: "See who liked you" },
  { icon: Crown, label: "Exclusive Premium badge" },
];

export function SubscriptionModal() {
  const [open, setOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handlePaywall = () => setOpen(true);
    window.addEventListener("paywall:triggered", handlePaywall);
    return () => window.removeEventListener("paywall:triggered", handlePaywall);
  }, []);

  const handleUpgrade = async () => {
    if (!coupon.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setLoading(true);
    try {
      await api.post("/subscriptions/upgrade", { coupon_code: coupon });
      toast.success("Welcome to Premium! Unlimited access unlocked.");
      setOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to redeem code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-dark-bg border-white/[0.08]">
        {/* Premium header with animated gradient */}
        <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-brand/20 to-violet-500/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />

          {/* Floating sparkle particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[
              { top: "15%", left: "10%", delay: "0s" },
              { top: "25%", left: "80%", delay: "0.3s" },
              { top: "60%", left: "20%", delay: "0.6s" },
              { top: "40%", left: "70%", delay: "0.9s" },
              { top: "75%", left: "50%", delay: "1.2s" },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full animate-pulse"
                style={{ top: p.top, left: p.left, animationDelay: p.delay, animationDuration: "2s" }}
              />
            ))}
          </div>

          {/* Crown icon */}
          <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/30 flex items-center justify-center mb-4 animate-glow-pulse" style={{ boxShadow: "0 0 30px rgba(245, 158, 11, 0.2)" }}>
            <Crown className="text-amber-400 w-8 h-8" />
          </div>

          <h2 className="relative z-10 text-2xl font-bold text-white mb-1">
            Daily Limit Reached
          </h2>
          <p className="relative z-10 text-sm text-zinc-400 max-w-[260px] mx-auto">
            Upgrade to <span className="text-amber-400 font-semibold">Intent Premium</span> for unlimited browsing
          </p>
        </div>

        {/* Perks list */}
        <div className="px-6 pb-2">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] divide-y divide-white/[0.04]">
            {PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-brand" />
                </div>
                <span className="text-sm text-zinc-200">{label}</span>
                <CheckCircle2 size={15} className="text-emerald-400 ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-4 space-y-3">
          <Input
            placeholder="Coupon code (try EARLYADOPTER)"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="bg-black/40 border-white/10 text-center text-white"
          />
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl h-11"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                Unlock Premium
              </>
            )}
          </Button>
          <button
            onClick={() => setOpen(false)}
            className="block mx-auto text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
