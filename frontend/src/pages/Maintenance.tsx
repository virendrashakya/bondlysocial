import { Wrench } from "lucide-react";
import { AuroraBg } from "../components/ui/AuroraBg";

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
      <AuroraBg />

      <div className="text-center px-6 animate-slide-up max-w-sm mx-auto">
        <div className="card p-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-900/30 border border-amber-800/30 flex items-center justify-center mx-auto mb-5">
            <Wrench size={28} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Under Maintenance</h1>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">
            We're upgrading IntentConnect to serve you better. We'll be back shortly — hang tight.
          </p>

          {/* Pulsing dots */}
          <div className="flex justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
