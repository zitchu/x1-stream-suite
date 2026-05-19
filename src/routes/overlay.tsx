import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/overlay/TopBar";
import { Panel } from "@/components/overlay/Panel";

export const Route = createFileRoute("/overlay")({
  head: () => ({
    meta: [{ title: "X1? — Match Overlay" }],
  }),
  component: OverlayScene,
});

function OverlayScene() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 p-4 flex flex-col gap-4">
        {/* Barra superior compacta */}
        <TopBar
          left={{ name: "WOLFE", tag: "USA", country: "Estados Unidos", score: 2 }}
          right={{ name: "BARUFFI", tag: "ITA", country: "Itália", score: 1 }}
          round="Top 8 — Worlds 2025"
          format="BO3"
          timer="42:17"
        />

        {/* Rodapé: casters + patrocinadores */}
        <div className="mt-auto flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <Panel className="w-full lg:w-[400px] p-4">
            <div className="flex items-center gap-3">
              <div className="w-1 self-stretch rounded-full bg-[color:var(--brand-pink)]" />
              <div>
                <p className="font-heading text-[9px] tracking-[0.25em] text-[color:var(--brand-blue)]">
                  NA TRANSMISSÃO
                </p>
                <p className="font-display text-lg text-white leading-none mt-1">
                  Aaron Zheng{" "}
                  <span className="text-white/40 text-sm">&amp;</span> Gabby Snyder
                </p>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Inglês — twitch.tv/x1
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="w-full lg:w-auto px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-heading text-[9px] tracking-[0.25em] text-white/50">
                PATROCINADORES
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <SponsorChip name="POKÉ MART" />
                <SponsorChip name="ROTOM HQ" />
                <SponsorChip name="SILPH CO" />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function SponsorChip({ name }: { name: string }) {
  return (
    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-heading text-[10px] tracking-[0.2em] text-white/75">
      {name}
    </div>
  );
}
