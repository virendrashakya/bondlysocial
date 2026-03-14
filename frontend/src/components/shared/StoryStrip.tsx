interface StoryProfile {
  id: number;
  name: string;
  avatar_url?: string;
  intent: string;
  online?: boolean;
}

interface Props {
  profiles: StoryProfile[];
  onSelect: (id: number) => void;
}

export function StoryStrip({ profiles, onSelect }: Props) {
  if (!profiles.length) return null;

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
      {profiles.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
        >
          <div className="relative">
            <div
              className={`w-[60px] h-[60px] rounded-full p-[2.5px] transition-transform group-hover:scale-105 ${
                p.online
                  ? "bg-gradient-to-br from-brand via-pink-400 to-orange-300"
                  : "bg-dark-border"
              }`}
            >
              <div className="w-full h-full rounded-full bg-dark-bg overflow-hidden">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-base font-bold text-brand bg-brand-muted">
                    {p.name[0]}
                  </div>
                )}
              </div>
            </div>
            {p.online && (
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-dark-bg" />
            )}
          </div>
          <span className="text-[11px] text-zinc-400 max-w-[56px] truncate leading-tight">
            {p.name.split(" ")[0]}
          </span>
        </button>
      ))}
    </div>
  );
}
