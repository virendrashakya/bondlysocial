import { cn } from "@/lib/utils";

interface AuthHeroPanelProps {
  illustration: string;
  heading: React.ReactNode;
  subtext: string;
  children?: React.ReactNode;
  /** Optional background image (e.g. downloaded from Pixabay) */
  bgImage?: string;
}

/**
 * Shared left-side hero panel for auth pages.
 * Renders a rich layered background with glows, particles, and the illustration on top.
 */
export function AuthHeroPanel({
  illustration,
  heading,
  subtext,
  children,
  bgImage,
}: AuthHeroPanelProps) {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center w-1/2 relative overflow-hidden">
      {/* ── Background layers ── */}

      {/* Optional photo background */}
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      )}

      {/* Base gradient (always rendered, sits behind or as fallback) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0520] via-[#12081a] to-[#0a0a0f]" />

      {/* Top-center radial glow — brand pink */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Bottom-left accent — purple */}
      <div className="absolute bottom-[10%] left-[10%] w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top-right accent — warm rose */}
      <div className="absolute top-[5%] right-[5%] w-64 h-64 bg-rose-500/8 rounded-full blur-[80px] pointer-events-none" />

      {/* Bokeh particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "12%", left: "20%", size: "6px", opacity: 0.5, delay: "0s" },
          { top: "30%", left: "75%", size: "4px", opacity: 0.3, delay: "1s" },
          { top: "55%", left: "15%", size: "5px", opacity: 0.4, delay: "2s" },
          { top: "70%", left: "60%", size: "3px", opacity: 0.3, delay: "0.5s" },
          { top: "20%", left: "50%", size: "7px", opacity: 0.2, delay: "1.5s" },
          { top: "80%", left: "35%", size: "4px", opacity: 0.35, delay: "3s" },
          { top: "45%", left: "85%", size: "5px", opacity: 0.25, delay: "2.5s" },
          { top: "8%",  left: "65%", size: "3px", opacity: 0.4, delay: "0.8s" },
          { top: "90%", left: "80%", size: "6px", opacity: 0.2, delay: "1.2s" },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-brand/80 animate-pulse"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: "3s",
            }}
          />
        ))}
      </div>

      {/* Subtle grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Content ── */}
      <img
        src={illustration}
        alt=""
        className={cn(
          "relative z-10 h-auto object-contain drop-shadow-2xl",
          "w-72 xl:w-80 2xl:w-96"
        )}
      />

      <div className="relative z-10 mt-8 text-center max-w-xs px-4">
        <h2 className="text-2xl font-bold text-white leading-snug">
          {heading}
        </h2>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          {subtext}
        </p>
      </div>

      {children && <div className="relative z-10 mt-6">{children}</div>}

      {/* Bottom attribution — subtle */}
      <p className="absolute bottom-3 left-0 right-0 text-center text-[9px] text-zinc-700 z-10">
        Art by Pixabay contributors
      </p>
    </div>
  );
}

/**
 * Mobile-only hero strip used at top of auth forms.
 */
export function AuthHeroMobile({ illustration }: { illustration: string }) {
  return (
    <div className="lg:hidden text-center mb-6">
      <div className="relative inline-block">
        {/* Glow behind image */}
        <div className="absolute inset-0 bg-brand/20 rounded-full blur-2xl scale-75 pointer-events-none" />
        <img
          src={illustration}
          alt=""
          className="relative w-28 sm:w-32 h-auto mx-auto object-contain"
        />
      </div>
      <h1 className="mt-3 text-2xl font-black text-brand tracking-tight">IntentConnect</h1>
      <p className="mt-1 text-xs text-zinc-500">Connect with purpose, not swipes.</p>
    </div>
  );
}
