import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/overlay/TopBar";
import { TeamPanel } from "@/components/overlay/TeamPanel";
import { MOCK_TEAM_RIGHT } from "@/components/overlay/mockData";

export const Route = createFileRoute("/game-hud-r")({
  head: () => ({
    meta: [{ title: "X1? — HUD Direito" }],
  }),
  component: GameHudRightScene,
});

function GameHudRightScene() {
  return (
    /*
     * OBS Browser Source: 1920×1080, fundo transparente.
     * Layout: Mantém a barra superior inteira no topo,
     * mas exibe apenas o painel de times direito (P2) abaixo.
     * O container do painel usa w-[950px] (aproximadamente metade da tela)
     * para manter o design de 2 colunas de cards sem espremer o texto.
     * A área da esquerda fica livre e transparente para capturar o jogo.
     */
    <div className="flex h-screen flex-col text-white overflow-hidden">
      {/* ── TopBar compacta no topo ── */}
      <div className="flex-none pt-2 px-3">
        <TopBar
          left={{ name: "WOLFE", tag: "LIQUID", country: "USA", score: 2 }}
          right={{ name: "BARUFFI", tag: "TSM", country: "ITA", score: 1 }}
          round="Grand Finals"
          format="BO5"
          timer="08:43"
        />
      </div>

      {/* ── Área de times: Apenas painel direito alinhado à direita ── */}
      <div className="flex-1 min-h-0 flex items-stretch justify-end gap-3 px-3 pt-6 pb-3">
        <div className="w-[768px] h-full">
          <TeamPanel
            side="right"
            team={MOCK_TEAM_RIGHT}
            playerName="BARUFFI"
            playerTag="TSM • ITA"
          />
        </div>
      </div>
    </div>
  );
}
