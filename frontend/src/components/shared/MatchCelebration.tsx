import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface Props {
  name: string;
  avatarUrl?: string;
  onDismiss: () => void;
}

const CONFETTI_COLORS = ["#FF3D6B", "#FF6B8A", "#A855F7", "#F59E0B", "#34D399", "#60A5FA"];

export function MatchCelebration({ name, avatarUrl, onDismiss }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onDismiss}
    >
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-confetti"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${-5 - Math.random() * 10}%`,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${Math.random() * 0.8}s`,
              animationDuration: `${1.2 + Math.random() * 1}s`,
            }}
          />
        ))}
      </div>

      {/* Central content */}
      <div className={`flex flex-col items-center gap-4 transition-all duration-500 ${show ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
        {/* Heart icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand to-pink-500 flex items-center justify-center animate-match-pop shadow-2xl shadow-brand/40">
            <Heart size={36} fill="white" className="text-white" />
          </div>
          {/* Burst rings */}
          <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-brand/50 animate-ping" />
        </div>

        {/* Avatar */}
        {avatarUrl && (
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand shadow-lg animate-match-pop" style={{ animationDelay: "0.2s" }}>
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Text */}
        <div className="text-center animate-match-pop" style={{ animationDelay: "0.3s" }}>
          <p className="text-2xl font-black text-gradient">It's a match!</p>
          <p className="text-sm text-zinc-400 mt-1">
            You and <span className="text-white font-semibold">{name}</span> are connected
          </p>
        </div>

        <p className="text-xs text-zinc-600 mt-2 animate-fade-in" style={{ animationDelay: "1s" }}>
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
