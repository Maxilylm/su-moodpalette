"use client";

import { useState, useEffect, useCallback } from "react";

interface PaletteColor {
  name: string;
  hex: string;
  usage: string;
}

interface Palette {
  palette_name: string;
  description: string;
  colors: PaletteColor[];
}

const PLACEHOLDER_MOODS = [
  "cozy autumn cafe",
  "cyberpunk nightclub",
  "zen garden at dawn",
  "underwater coral reef",
  "90s arcade",
  "Parisian sunset rooftop",
  "bioluminescent deep sea",
  "vintage vinyl record shop",
];

const QUICK_MOODS = [
  { emoji: "\u{1F305}", label: "Sunrise" },
  { emoji: "\u{1F30A}", label: "Ocean" },
  { emoji: "\u{1F332}", label: "Forest" },
  { emoji: "\u{1F525}", label: "Fire" },
  { emoji: "\u{2744}\u{FE0F}", label: "Arctic" },
  { emoji: "\u{1F303}", label: "Nightlife" },
  { emoji: "\u{1F338}", label: "Cherry Blossom" },
  { emoji: "\u{1F3DC}\u{FE0F}", label: "Desert" },
];

const SURPRISE_MOODS = [
  "a wizard's library at midnight",
  "neon-soaked Tokyo alley in rain",
  "lavender fields in Provence",
  "Northern Lights dancing over Iceland",
  "a jazz club in 1950s Harlem",
  "tropical thunderstorm at dusk",
  "abandoned space station orbiting Jupiter",
  "Moroccan spice market at noon",
  "foggy London bridge in autumn",
  "synthwave dreamscape",
  "Hawaiian volcano at sunset",
  "enchanted mushroom forest",
];

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#0a0a0f" : "#ffffff";
}

function CopyNotification({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-up">
      <div className="glass rounded-xl px-5 py-3 text-sm font-medium text-white shadow-2xl">
        Copied to clipboard!
      </div>
    </div>
  );
}

function GradientBar({ colors }: { colors: PaletteColor[] }) {
  const gradient = colors.map((c) => c.hex).join(", ");
  return (
    <div
      className="w-full h-16 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${gradient})`,
      }}
    />
  );
}

function ColorCard({
  color,
  index,
  onCopy,
}: {
  color: PaletteColor;
  index: number;
  onCopy: (text: string) => void;
}) {
  const contrast = getContrastColor(color.hex);
  return (
    <button
      onClick={() => onCopy(color.hex)}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-2xl animate-fade-up"
      style={{
        animationDelay: `${index * 100}ms`,
        minHeight: "220px",
      }}
      title={`Click to copy ${color.hex}`}
    >
      <div
        className="flex-1 flex flex-col justify-end p-4 relative"
        style={{ backgroundColor: color.hex }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
          <span className="text-white text-sm font-bold tracking-wider bg-black/50 px-3 py-1 rounded-full">
            COPY
          </span>
        </div>
        <div className="relative z-10">
          <p
            className="text-xs font-mono font-bold tracking-wider uppercase mb-1"
            style={{ color: contrast }}
          >
            {color.hex}
          </p>
          <p
            className="text-base font-bold leading-tight"
            style={{ color: contrast }}
          >
            {color.name}
          </p>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur px-4 py-2.5 border-t border-white/10">
        <span className="text-[11px] font-mono text-white/60 uppercase tracking-widest">
          {color.usage}
        </span>
      </div>
    </button>
  );
}

function PaletteHistory({
  palettes,
  onSelect,
}: {
  palettes: Palette[];
  onSelect: (p: Palette) => void;
}) {
  if (palettes.length === 0) return null;
  return (
    <div className="mt-12">
      <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4">
        Recent Palettes
      </h3>
      <div className="flex gap-4 flex-wrap">
        {palettes.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p)}
            className="glass glass-hover rounded-xl p-3 cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <div className="flex gap-0.5 rounded-lg overflow-hidden mb-2">
              {p.colors.map((c, j) => (
                <div
                  key={j}
                  className="w-8 h-8"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <p className="text-xs text-white/60 truncate max-w-[180px]">
              {p.palette_name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ExportButtons({
  palette,
  onCopy,
}: {
  palette: Palette;
  onCopy: (text: string) => void;
}) {
  const cssVars = palette.colors
    .map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} - ${c.usage} */`)
    .join("\n");
  const cssBlock = `:root {\n${cssVars}\n}`;

  const tailwindColors = palette.colors.reduce(
    (acc, c, i) => {
      acc[`palette-${i + 1}`] = c.hex;
      return acc;
    },
    {} as Record<string, string>
  );
  const tailwindConfig = JSON.stringify(
    { colors: { extend: tailwindColors } },
    null,
    2
  );

  const jsonExport = JSON.stringify(palette, null, 2);

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <button
        onClick={() => onCopy(cssBlock)}
        className="glass glass-hover rounded-xl px-4 py-2.5 text-xs font-mono text-white/70 hover:text-white transition-all duration-200"
      >
        Copy CSS Variables
      </button>
      <button
        onClick={() => onCopy(tailwindConfig)}
        className="glass glass-hover rounded-xl px-4 py-2.5 text-xs font-mono text-white/70 hover:text-white transition-all duration-200"
      >
        Copy Tailwind Config
      </button>
      <button
        onClick={() => onCopy(jsonExport)}
        className="glass glass-hover rounded-xl px-4 py-2.5 text-xs font-mono text-white/70 hover:text-white transition-all duration-200"
      >
        Copy as JSON
      </button>
    </div>
  );
}

export default function Home() {
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [history, setHistory] = useState<Palette[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_MOODS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const generate = useCallback(async (moodText: string) => {
    if (!moodText.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: moodText.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate palette");
        return;
      }

      setPalette(data);
      setHistory((prev) => [data, ...prev].slice(0, 3));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate(mood);
  };

  const handleSurprise = () => {
    const random =
      SURPRISE_MOODS[Math.floor(Math.random() * SURPRISE_MOODS.length)];
    setMood(random);
    generate(random);
  };

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-12 md:py-20 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        {palette && (
          <div
            className="absolute top-0 left-0 w-full h-full opacity-10 transition-all duration-1000"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${palette.colors[2]?.hex}40, transparent 70%)`,
            }}
          />
        )}
      </div>

      <CopyNotification show={copied} />

      {/* Header */}
      <div className="relative z-10 text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
            MoodPalette
          </span>
        </h1>
        <p className="text-white/40 text-lg font-light">
          Describe a vibe. Get a palette.
        </p>
      </div>

      {/* Input Section */}
      <div className="relative z-10 w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder={PLACEHOLDER_MOODS[placeholderIndex]}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-lg text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 pr-36"
            disabled={loading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              type="button"
              onClick={handleSurprise}
              disabled={loading}
              className="px-3 py-2.5 text-xl text-white/50 hover:text-white transition-colors duration-200 disabled:opacity-30"
              title="Surprise Me"
            >
              {"\u{1F3B2}"}
            </button>
            <button
              type="submit"
              disabled={loading || !mood.trim()}
              className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  ...
                </span>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </form>

        {/* Quick Mood Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {QUICK_MOODS.map((qm) => (
            <button
              key={qm.label}
              onClick={() => {
                setMood(qm.label.toLowerCase());
                generate(qm.label.toLowerCase());
              }}
              disabled={loading}
              className="glass glass-hover rounded-full px-4 py-2 text-sm text-white/60 hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {qm.emoji} {qm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="relative z-10 mt-8 glass rounded-xl px-6 py-4 border-red-500/30 text-red-300 text-sm max-w-2xl w-full">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && !palette && (
        <div className="relative z-10 mt-16 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-12 h-20 rounded-xl bg-white/5 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-white/30 text-sm">Mixing colors...</p>
        </div>
      )}

      {/* Palette Display */}
      {palette && (
        <div className="relative z-10 w-full max-w-4xl mt-12 animate-fade-up">
          {/* Palette Info */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {palette.palette_name}
            </h2>
            <p className="text-white/40 text-base italic">
              {palette.description}
            </p>
          </div>

          {/* Gradient Bar */}
          <GradientBar colors={palette.colors} />

          {/* Color Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            {palette.colors.map((color, i) => (
              <ColorCard
                key={`${color.hex}-${i}`}
                color={color}
                index={i}
                onCopy={copyToClipboard}
              />
            ))}
          </div>

          {/* Export Buttons */}
          <div className="flex justify-center">
            <ExportButtons palette={palette} onCopy={copyToClipboard} />
          </div>
        </div>
      )}

      {/* History */}
      <div className="relative z-10 w-full max-w-4xl">
        <PaletteHistory
          palettes={history.filter((h) => h !== palette)}
          onSelect={(p) => setPalette(p)}
        />
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-auto pt-16 pb-6 text-center">
        <p className="text-white/20 text-xs font-mono">
          Powered by Groq + Llama 3.3
        </p>
      </footer>
    </main>
  );
}
