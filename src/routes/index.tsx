import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/overlay/BrandLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "X1? — Overlay Suite" },
      { name: "description", content: "Professional streaming overlay system for X1? competitive Pokémon broadcasts." },
    ],
  }),
  component: Index,
});

const ROUTES = [
  { to: "/overlay", label: "Match Overlay", desc: "Top bar with score, players, round & format." },
  { to: "/game-hud", label: "Game HUD", desc: "Pokémon competitive HUD — left or right." },
  { to: "/chat", label: "Chat", desc: "Clean chat container for Twitch / YouTube / Kick." },
  { to: "/starting-soon", label: "Starting Soon", desc: "Pre-stream holding screen." },
  { to: "/brb", label: "Be Right Back", desc: "Intermission screen with socials & schedule." },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-[color:var(--brand-ink)] text-white p-8 flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <BrandLogo />
        <div className="text-right">
          <p className="font-heading text-[11px] tracking-[0.25em] text-[color:var(--brand-blue)]">
            BROADCAST SUITE
          </p>
          <h1 className="font-display text-4xl">X1? Overlays</h1>
        </div>
      </header>

      <p className="max-w-2xl text-white/70">
        Each scene below is a dedicated route designed for an OBS Browser Source at
        1920×1080. Backgrounds are transparent — drop the URL straight into OBS.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROUTES.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className="group rounded-2xl bg-[color:var(--surface-elevated)] ring-brand edge-brand p-5 transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading text-[10px] tracking-[0.25em] text-[color:var(--brand-blue)]">
                ROUTE
              </span>
              <code className="text-xs text-white/50 group-hover:text-[color:var(--brand-pink)] transition-colors">
                {r.to}
              </code>
            </div>
            <h2 className="font-display text-2xl mb-1">{r.label}</h2>
            <p className="text-sm text-white/60">{r.desc}</p>
            <div className="accent-bar h-1 mt-4 rounded-full opacity-70" />
          </Link>
        ))}
      </div>

      <footer className="mt-auto text-xs text-white/40">
        Add 1920×1080 Browser Sources in OBS pointing to each route. Transparent background enabled.
      </footer>
    </div>
  );
}
