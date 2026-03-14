import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Tenor API v2 — free tier (anonymous key for dev, replace with your own in production)
const TENOR_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";
const TENOR_BASE = "https://tenor.googleapis.com/v2";

interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    tinygif?: { url: string; dims: [number, number] };
    gif?: { url: string; dims: [number, number] };
    nanogif?: { url: string; dims: [number, number] };
  };
}

interface GifPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchGifs = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const endpoint = searchQuery.trim()
        ? `${TENOR_BASE}/search?q=${encodeURIComponent(searchQuery)}&key=${TENOR_KEY}&limit=20&media_filter=tinygif,gif`
        : `${TENOR_BASE}/featured?key=${TENOR_KEY}&limit=20&media_filter=tinygif,gif`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setGifs(data.results ?? []);
    } catch {
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load trending on mount
  useEffect(() => {
    fetchGifs("");
    inputRef.current?.focus();
  }, [fetchGifs]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGifs(query);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchGifs]);

  const getGifUrl = (gif: TenorGif) =>
    gif.media_formats.tinygif?.url ?? gif.media_formats.gif?.url ?? "";

  return (
    <div className="border-t border-white/[0.08] bg-[rgba(12,12,12,0.96)] backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="pl-8 h-8 text-xs rounded-lg"
            autoComplete="off"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-zinc-500 hover:text-white flex-shrink-0"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Grid */}
      <div className="h-52 overflow-y-auto px-2 py-2">
        {loading && gifs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="text-zinc-500 animate-spin" />
          </div>
        )}

        {!loading && gifs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-zinc-600">No GIFs found</p>
          </div>
        )}

        <div className="columns-2 gap-1.5">
          {gifs.map((gif) => {
            const url = getGifUrl(gif);
            if (!url) return null;
            return (
              <button
                key={gif.id}
                onClick={() => onSelect(url)}
                className={cn(
                  "mb-1.5 w-full rounded-lg overflow-hidden",
                  "hover:ring-2 hover:ring-brand hover:ring-offset-1 hover:ring-offset-dark-bg",
                  "transition-all active:scale-95 break-inside-avoid"
                )}
              >
                <img
                  src={url}
                  alt={gif.title}
                  className="w-full object-cover rounded-lg"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Powered by Tenor */}
      <div className="px-3 py-1.5 border-t border-white/[0.06] text-center">
        <span className="text-[9px] text-zinc-600">Powered by Tenor</span>
      </div>
    </div>
  );
}
