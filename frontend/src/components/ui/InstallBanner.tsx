import { Download, X } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useState } from "react";

export function InstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40 animate-slide-up">
      <div className="card-modal p-4 flex items-center gap-3 shadow-2xl border-brand/20">
        <div className="w-10 h-10 rounded-xl bg-brand-muted border border-brand-border flex items-center justify-center flex-shrink-0">
          <Download size={18} className="text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Install IntentConnect</p>
          <p className="text-xs text-zinc-500">Best experience on your home screen</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={install}
            className="text-xs px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
          >
            Install
          </button>
          <button onClick={() => setDismissed(true)} className="text-zinc-600 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
