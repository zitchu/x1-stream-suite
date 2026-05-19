import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/overlay/TopBar";
import { TeamPanel } from "@/components/overlay/TeamPanel";
import { MOCK_TEAM_LEFT, MOCK_TEAM_RIGHT } from "@/components/overlay/mockData";
import { Panel } from "@/components/overlay/Panel";

export const Route = createFileRoute("/game-hud")({
  head: () => ({
    meta: [{ title: "X1? — Game HUD" }],
  }),
  component: GameHudScene,
});

type Side = "left" | "right";

function GameHudScene() {
  // Which side currently holds team 1 (the "team panel")
  // Toggle with hotkey ?side=right or in-overlay control
  const [primarySide, setPrimarySide] = useState<Side>("left");

  return (
    <div className="fixed inset-0 text-white">
      {/* Top bar with margin */}
      <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none">
        <TopBar
          left={{ name: "WOLFE", tag: "LIQUID", score: 2 }}
          right={{ name: "BARUFFI", tag: "TSM", score: 1 }}
          round="Grand Finals"
          format="BO5"
          timer="08:43"
        />
      </div>

      {/* Side panels — left & right with ~2rem safe margin */}
      <div className="absolute inset-0 flex items-end pb-6 px-8 pointer-events-none">
        <div className="flex w-full justify-between items-end">
          {primarySide === "left" ? (
            <>
              <TeamPanel side="left" team={MOCK_TEAM_LEFT} playerName="WOLFE" playerTag="LIQUID • USA" />
              <SwapControl side={primarySide} onSwap={() => setPrimarySide("right")} />
            </>
          ) : (
            <>
              <SwapControl side={primarySide} onSwap={() => setPrimarySide("left")} />
              <TeamPanel side="right" team={MOCK_TEAM_RIGHT} playerName="BARUFFI" playerTag="TSM • ITA" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SwapControl({ side, onSwap }: { side: Side; onSwap: () => void }) {
  return (
    <Panel className="px-4 py-3 pointer-events-auto">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-heading text-[10px] tracking-[0.25em] text-[color:var(--brand-blue)]">
            HUD SIDE
          </p>
          <p className="font-display text-lg leading-none mt-1 uppercase">{side}</p>
        </div>
        <button
          onClick={onSwap}
          className="px-3 py-1.5 rounded-lg bg-[color:var(--brand-pink)] text-white font-heading text-[11px] tracking-[0.2em] hover:opacity-90 transition"
        >
          SWAP
        </button>
      </div>
    </Panel>
  );
}
