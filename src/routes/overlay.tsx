import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/overlay/TopBar";
import { Panel, PanelHeader } from "@/components/overlay/Panel";

export const Route = createFileRoute("/overlay")({
  head: () => ({
    meta: [{ title: "X1? — Match Overlay" }],
  }),
  component: OverlayScene,
});

function OverlayScene() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Safe-area container */}
      <div className="absolute inset-0 p-8 flex flex-col">
        <TopBar
          left={{ name: "WOLFE", tag: "USA", country: "United States", score: 2 }}
          right={{ name: "BARUFFI", tag: "ITA", country: "Italy", score: 1 }}
          round="Top 8 — Worlds 2025"
          format="BO3"
          timer="42:17"
        />

        {/* Bottom strip: lower third + sponsors */}
        <div className="mt-auto flex items-end justify-between gap-4">
          <Panel className="w-[420px] p-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 self-stretch rounded-full bg-[color:var(--brand-pink)]" />
              <div>
                <p className="font-heading text-[10px] tracking-[0.25em] text-[color:var(--brand-blue)]">
                  ON CAST
                </p>
                <p className="font-display text-xl text-white leading-none mt-1">
                  Aaron Zheng <span className="text-white/40 text-base">&amp;</span> Gabby Snyder
                </p>
                <p className="text-xs text-white/50 mt-1">
                  English — twitch.tv/x1
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="px-5 py-3">
            <div className="flex items-center gap-4">
              <span className="font-heading text-[10px] tracking-[0.25em] text-white/50">
                POWERED BY
              </span>
              <div className="flex items-center gap-3">
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
    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-heading text-[11px] tracking-[0.2em] text-white/80">
      {name}
    </div>
  );
}
