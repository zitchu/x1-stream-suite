import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/overlay/TopBar";
import { TeamPanel } from "@/components/overlay/TeamPanel";
import { MOCK_TEAM_LEFT } from "@/components/overlay/mockData";

export const Route = createFileRoute("/game-hud-l")({
  head: () => ({
    meta: [{ title: "X1? — HUD Esquerdo" }],
  }),
  component: GameHudLeftScene,
});

function GameHudLeftScene() {
  return (
    /*
     * OBS Browser Source: 1920×1080, fundo transparente.
     * Layout: Mantém a barra superior inteira no topo,
     * mas exibe apenas o painel de times esquerdo (P1) abaixo.
     * O container do painel usa w-[950px] (aproximadamente metade da tela)
     * para manter o design de 2 colunas de cards sem espremer o texto.
     * A área da direita fica livre e transparente para capturar o jogo.
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

      {/* ── Área de times: Apenas painel esquerdo alinhado à esquerda ── */}
      <div className="flex-1 min-h-0 flex items-stretch justify-start gap-3 px-3 pt-6 pb-3">
        <div className="w-[768px] h-full">
          <TeamPanel
            side="left"
            team={MOCK_TEAM_LEFT}
            playerName="WOLFE"
            playerTag="LIQUID • USA"
          />
        </div>
      </div>
    </div>
  );
}
