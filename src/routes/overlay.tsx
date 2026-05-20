import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/overlay/TopBar";
import { Panel } from "@/components/overlay/Panel";
import { ActivePokemonSidebar } from "@/components/overlay/ActivePokemonSidebar";

import { useStreamState } from "@/hooks/useStreamState";

export const Route = createFileRoute("/overlay")({
  head: () => ({
    meta: [{ title: "X1? — Match Overlay" }],
  }),
  component: OverlayScene,
});

function OverlayScene() {
  const { state } = useStreamState();

  return (
    <div className="fixed inset-0 pointer-events-none">
      <ActivePokemonSidebar team={state.teamLeft} side="left" />
      <ActivePokemonSidebar team={state.teamRight} side="right" />
      <div className="absolute inset-0 p-4 flex flex-col gap-4">
        {/* Barra superior compacta */}
        <TopBar
          left={state.left}
          right={state.right}
          round={state.round}
          format={state.format}
          timer={state.timer}
          hideTimer
          isHud
        />

        {/* Rodapé: casters + patrocinadores */}
        <div className="mt-auto flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-center lg:gap-6">
          {state.showBroadcastPanel && (
            <Panel className="w-full max-w-[420px] p-4 mx-auto lg:mx-0">
              <div className="flex items-center gap-3">
                <div className="w-1 self-stretch rounded-full bg-[color:var(--brand-pink)]" />
                <div>
                  <p className="font-heading text-[9px] tracking-[0.25em] text-[color:var(--brand-blue)]">
                    {state.broadcastTitle}
                  </p>
                  <p className="font-display text-lg text-white leading-none mt-1">
                    {state.broadcastNames}
                  </p>
                  <p className="text-[11px] text-white/50 mt-0.5">{state.broadcastDescription}</p>
                </div>
              </div>
            </Panel>
          )}

          {state.showSponsorPanel && (
            <Panel className="w-full max-w-[420px] px-4 py-2.5 mx-auto lg:mx-0">
              <div className="flex flex-wrap items-center gap-3 justify-center">
                <span className="font-heading text-[9px] tracking-[0.25em] text-white/50">
                  {state.sponsorTitle}
                </span>
                <div className="flex flex-wrap items-center gap-2 justify-center">
                  {state.sponsorItems.map((name) => (
                    <SponsorChip key={name} name={name} />
                  ))}
                </div>
              </div>
            </Panel>
          )}
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
