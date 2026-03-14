import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function GlassModal({ open, onClose, title, children, maxWidth = "max-w-md" }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} card-modal shadow-2xl animate-slide-up`}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
