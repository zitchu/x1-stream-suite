import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/overlay/BrandLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "X1? — Overlay Suite" },
      {
        name: "description",
        content: "Suíte de overlays X1? para transmissões competitivas de Pokémon.",
      },
    ],
  }),
  component: Index,
});

const ROUTES = [
  {
    to: "/overlay",
    label: "Match Overlay",
    desc: "Barra superior com placar, jogadores, round e formato.",
  },
  {
    to: "/game-hud-l",
    label: "HUD Esquerdo",
    desc: "HUD competitivo de Pokémon — lado esquerdo (Time P1).",
  },
  {
    to: "/game-hud-r",
    label: "HUD Direito",
    desc: "HUD competitivo de Pokémon — lado direito (Time P2).",
  },
  { to: "/chat", label: "Chat", desc: "Container limpo para Twitch, YouTube ou Kick." },
  { to: "/starting-soon", label: "Starting Soon", desc: "Tela de espera pré-transmissão." },
  { to: "/brb", label: "Be Right Back", desc: "Tela de intervalo com redes sociais e agenda." },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-[color:var(--brand-ink)] text-white p-8 flex flex-col gap-10">
      <header className="flex items-center justify-between gap-6">
        <BrandLogo />
        <div className="text-right">
          <p className="font-heading text-[11px] tracking-[0.25em] text-[color:var(--brand-blue)]">
            BROADCAST SUITE
          </p>
          <h1 className="font-display text-4xl">X1? Overlays</h1>
        </div>
      </header>

      <p className="max-w-2xl text-white/70">
        Cada cena abaixo é criada para OBS Browser Source em 1920×1080. Fundo transparente pronto
        para uso direto.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROUTES.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className="group rounded-[1.8rem] bg-[color:var(--surface-elevated)] ring-brand edge-brand p-5 transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading text-[10px] tracking-[0.25em] text-[color:var(--brand-blue)]">
                CENA
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
        Adicione cada rota como Browser Source 1920×1080 no OBS. Fundos transparentes, fácil
        montagem.
      </footer>
    </div>
  );
}
