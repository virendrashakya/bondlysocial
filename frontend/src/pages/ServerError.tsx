import { RefreshCw, Home } from "lucide-react";
import { AuroraBg } from "@/components/ui/AuroraBg";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
      <AuroraBg />

      <div className="text-center px-6 animate-slide-up">
        <p className="text-[160px] font-black leading-none select-none tracking-tighter"
           style={{ color: "rgba(220, 38, 38, 0.1)" }}>
          500
        </p>

        <GlassCard variant="elevated" padding="lg" className="-mt-8 max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-900/30 border border-rose-800/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">
            An unexpected server error occurred. Our team has been notified and is working on a fix.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              <RefreshCw size={14} /> Try again
            </Button>
            <Button onClick={() => (window.location.href = "/discover")}>
              <Home size={14} /> Home
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
