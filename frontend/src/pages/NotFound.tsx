import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { AuroraBg } from "../components/ui/AuroraBg";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
      <AuroraBg />

      <div className="text-center px-6 animate-slide-up">
        {/* Big number */}
        <p className="text-[160px] font-black leading-none select-none tracking-tighter"
           style={{ color: "rgba(255, 61, 107, 0.12)" }}>
          404
        </p>

        {/* Glass card */}
        <div className="card p-8 -mt-8 max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-brand-muted border border-brand-border flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Page not found</h1>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">
            This page doesn't exist or was moved. Let's get you back on track.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Go back
            </button>
            <button
              onClick={() => navigate("/discover")}
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
