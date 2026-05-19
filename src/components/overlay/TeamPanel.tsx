import { cn } from "@/lib/utils";
import { PokemonCard, type PokemonCardData } from "./PokemonCard";
import { Panel, PanelHeader } from "./Panel";

export function TeamPanel({
  side,
  team,
  playerName,
  playerTag,
  className,
}: {
  side: "left" | "right";
  team: PokemonCardData[];
  playerName: string;
  playerTag?: string;
  className?: string;
}) {
  // Sempre 6 slots
  const slots: (PokemonCardData | null)[] = [...team];
  while (slots.length < 6) slots.push(null);

  return (
    <Panel
      tone="elevated"
      className={cn(
        // flex-1 + h-full garante que o painel preencha o espaço vertical disponível
        "flex-1 min-w-0 h-full p-3 flex flex-col gap-2 pointer-events-auto",
        className,
      )}
    >
      {/* Cabeçalho */}
      <PanelHeader
        kicker={playerTag ? "JOGADOR" : undefined}
        title={playerName}
        right={
          <div className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
            {side === "left" ? "J1" : "J2"}
          </div>
        }
      />

      {/* Subtítulo */}
      {playerTag && (
        <div className="flex items-center justify-between px-4 -mt-1">
          <span className="font-heading text-[9px] tracking-[0.2em] text-white/50 truncate">
            {playerTag}
          </span>
          <span className="text-[9px] uppercase tracking-[0.15em] text-[color:var(--brand-blue)] opacity-70">
            {side === "left" ? "HUD Esquerdo" : "HUD Direito"}
          </span>
        </div>
      )}

      {/* Grid de cards: 3 linhas × 2 colunas — alturas iguais via grid */}
      <div className="grid grid-rows-3 gap-2 flex-1 min-h-0">
        {[0, 1, 2].map((row) => (
          <div key={row} className="grid grid-cols-2 gap-2 min-h-0">
            {slots.slice(row * 2, row * 2 + 2).map((p, i) => (
              <div key={i} className="min-h-0">
                {p ? (
                  <PokemonCard className="h-full" data={p} mirror={side === "right"} />
                ) : (
                  <EmptySlot className="h-full" mirror={side === "right"} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function EmptySlot({
  mirror,
  className,
}: {
  mirror?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full h-full rounded-2xl border border-dashed border-white/10 bg-white/[0.02]",
        "flex items-center gap-3 px-4 overflow-hidden",
        mirror && "flex-row-reverse",
        className,
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-black/20 flex-shrink-0" />
      <span className="font-heading text-[8px] uppercase tracking-[0.2em] text-white/25">
        slot vazio
      </span>
    </div>
  );
}

// Re-export
export { PanelHeader };
