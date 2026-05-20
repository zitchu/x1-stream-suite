import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/overlay/TopBar";
import { TeamPanel } from "@/components/overlay/TeamPanel";
import { usePokemonTeam } from "@/hooks/usePokemonTeam";
import { useStreamState } from "@/hooks/useStreamState";

export const Route = createFileRoute("/game-hud-r")({
  head: () => ({
    meta: [{ title: "X1? — HUD Direito" }],
  }),
  component: GameHudRightScene,
});

function GameHudRightScene() {
  const { state } = useStreamState();

  /**
   * usePokemonTeam enriquece o time base de forma assíncrona:
   *  - sprites da PokéAPI
   *  - moves / items / abilities do Smogon Stats (se não fornecidos)
   * O time base (state.teamRight) aparece imediatamente; os dados chegam em background.
   */
  const team = usePokemonTeam(state.teamRight);

  const playerTag = [state.right.tag, state.right.country].filter(Boolean).join(" • ");

  return (
    /*
     * OBS Browser Source: 1920×1080, fundo transparente.
     * Layout: TopBar inteira no topo + painel do J2 (direita).
     * A área esquerda fica transparente para capturar o jogo.
     */
    <div className="relative flex h-screen flex-col text-white overflow-hidden">
      {/* ── TopBar compacta no topo ── */}
      <div className="flex-none pt-2 px-3">
        <TopBar
          left={state.left}
          right={state.right}
          round={state.round}
          format={state.format}
          timer={state.timer}
          hideTimer
          isHud
        />
      </div>

      {/* ── Área de times: Apenas painel direito alinhado à direita ── */}
      <div className="flex-1 min-h-0 flex items-stretch justify-end gap-3 px-3 pt-6 pb-3">
        <div className="w-[768px] h-full">
          <TeamPanel
            side="right"
            team={team}
            playerName={state.right.name}
            playerTag={playerTag || undefined}
          />
        </div>
      </div>
    </div>
  );
}
