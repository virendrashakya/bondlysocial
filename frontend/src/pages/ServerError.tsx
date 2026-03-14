import { RefreshCw, Home } from "lucide-react";
import { AuroraBg } from "../components/ui/AuroraBg";

export function ServerErrorPage() {

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
      <AuroraBg />

      <div className="text-center px-6 animate-slide-up">
        {/* Big number */}
        <p className="text-[160px] font-black leading-none select-none tracking-tighter"
           style={{ color: "rgba(220, 38, 38, 0.1)" }}>
          500
        </p>

        {/* Glass card */}
        <div className="card p-8 -mt-8 max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-900/30 border border-rose-800/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">
            An unexpected server error occurred. Our team has been notified and is working on a fix.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={14} /> Try again
            </button>
            <button
              onClick={() => (window.location.href = "/discover")}
              className="btn-primary flex items-center gap-2"
            >
              <Home size={14} /> Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
