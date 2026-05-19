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
  // Pad to 6 slots
  const slots: (PokemonCardData | null)[] = [...team];
  while (slots.length < 6) slots.push(null);

  const accent = side === "left" ? "var(--brand-pink)" : "var(--brand-blue)";

  return (
    <Panel
      tone="elevated"
      className={cn(
        "w-[44%] max-w-[640px] p-4 flex flex-col gap-3 pointer-events-auto",
        className,
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-1",
          side === "right" && "flex-row-reverse text-right",
        )}
      >
        <div
          className="w-1.5 self-stretch rounded-full"
          style={{ background: accent }}
        />
        <div className="flex flex-col leading-tight min-w-0 flex-1">
          {playerTag && (
            <span className="font-heading text-[10px] tracking-[0.2em] text-white/60 truncate">
              {playerTag}
            </span>
          )}
          <span className="font-display text-2xl text-white truncate">
            {playerName}
          </span>
        </div>
        <span
          className="font-display text-3xl"
          style={{ color: accent }}
        >
          {side === "left" ? "P1" : "P2"}
        </span>
      </div>

      {/* 6 cards in 2x3 (2 cols x 3 rows) */}
      <div className="grid grid-cols-2 grid-rows-3 gap-2.5">
        {slots.map((p, i) =>
          p ? (
            <PokemonCard key={i} data={p} mirror={side === "right"} />
          ) : (
            <EmptySlot key={i} mirror={side === "right"} />
          ),
        )}
      </div>
    </Panel>
  );
}

function EmptySlot({ mirror }: { mirror?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-white/10 bg-white/[0.02]",
        "px-3 py-2.5 h-[70px] flex items-center gap-3",
        mirror && "flex-row-reverse",
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-black/20" />
      <span className="font-heading text-[10px] tracking-[0.2em] text-white/20">
        slot empty
      </span>
    </div>
  );
}

// Re-export the PanelHeader if anyone wants it
export { PanelHeader };
