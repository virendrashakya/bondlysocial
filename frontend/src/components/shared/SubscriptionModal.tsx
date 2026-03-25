import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

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
      // Reload perfectly refreshes the session and allows the user to continue seamlessly
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to redeem code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-dark-bg border-white/[0.08]">
        <div className="relative p-6 pt-8 pb-8 flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent opacity-50" />
          
          <div className="relative z-10 w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center mb-4 border border-brand/50">
            <Sparkles className="text-brand w-8 h-8" />
          </div>
          
          <h2 className="relative z-10 text-2xl font-bold text-white mb-2">
            Daily Limit Reached
          </h2>
          
          <p className="relative z-10 text-zinc-400 mb-6 max-w-[280px]">
            You've viewed your 10 free profiles for today. Upgrade to Intent Premium for unlimited browsing.
          </p>

          <div className="relative z-10 w-full space-y-4">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-left">
              <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider text-center">Premium Perks</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-brand" /> Unlimited Profile Views
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-brand" /> Priority placement in Discovery
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-brand" /> See who liked you
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <Input 
                placeholder="Got a coupon code? (Try EARLYADOPTER)" 
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="bg-black/40 border-white/10 text-center text-white"
              />
              <Button 
                onClick={handleUpgrade} 
                disabled={loading}
                className="w-full bg-brand hover:bg-brand-hover text-white rounded-full h-11 font-semibold"
              >
                {loading ? "Upgrading..." : "Unlock Premium Now"}
              </Button>
            </div>
            
            <button onClick={() => setOpen(false)} className="text-xs text-zinc-500 hover:text-white transition-colors mt-2">
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
