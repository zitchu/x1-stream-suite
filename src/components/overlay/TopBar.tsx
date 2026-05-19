import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";

export interface PlayerInfo {
  name: string;
  tag?: string;
  country?: string;
  score: number;
}

export function TopBar({
  left,
  right,
  round = "Round 1",
  format = "BO3",
  timer = "00:00",
  className,
}: {
  left: PlayerInfo;
  right: PlayerInfo;
  round?: string;
  format?: "BO3" | "BO5";
  timer?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // Barra compacta — menos altura, mais próxima do topo
        "w-full flex items-stretch gap-2 rounded-[1.8rem] border border-white/10 bg-[color:var(--surface)] backdrop-blur-lg ring-brand edge-brand overflow-visible",
        className,
      )}
    >
      <PlayerSlot p={left} align="left" accent="pink" />

      {/* Centro: placar + logo + info do round */}
      <div className="flex items-center gap-3 px-3 py-1 bg-black/15 border-x border-white/10 overflow-visible">
        <div className="flex items-center gap-3 overflow-visible">
          <ScoreBlock value={left.score} tone="pink" />

          {/* Logo: overflow PARA BAIXO via clip-path e margem negativa */}
          <BrandLogo
            className="min-w-[160px] h-[64px] px-4"
            overflowBottom="2rem"
            alt="X1?"
          />

          <ScoreBlock value={right.score} tone="blue" />
        </div>

        {/* Round / Formato / Tempo */}
        <div className="flex flex-col items-center leading-tight ml-1">
          <span className="font-heading text-[9px] tracking-[0.2em] text-white/60 uppercase">
            {round}
          </span>
          <span className="font-display text-base text-white">{format}</span>
          <span className="font-mono text-[10px] text-[color:var(--brand-blue)]">
            {timer}
          </span>
        </div>
      </div>

      <PlayerSlot p={right} align="right" accent="blue" />
    </div>
  );
}

function PlayerSlot({
  p,
  align,
  accent,
}: {
  p: PlayerInfo;
  align: "left" | "right";
  accent: "pink" | "blue";
}) {
  return (
    <div
      className={cn(
        "flex-1 flex items-center gap-2.5 px-4 py-2",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      {/* Barra colorida lateral */}
      <div
        className={cn(
          "w-1 self-stretch rounded-full",
          accent === "pink"
            ? "bg-[color:var(--brand-pink)]"
            : "bg-[color:var(--brand-blue)]",
        )}
      />
      <div className="flex flex-col leading-tight min-w-0">
        {p.tag && (
          <span className="font-heading text-[9px] tracking-[0.2em] text-white/55 truncate">
            {p.tag}
          </span>
        )}
        <span className="font-display text-xl text-white truncate">{p.name}</span>
        {p.country && (
          <span className="text-[10px] text-white/45">{p.country}</span>
        )}
      </div>
    </div>
  );
}

function ScoreBlock({ value, tone }: { value: number; tone: "pink" | "blue" }) {
  return (
    <div
      className="min-w-[42px] h-10 rounded-xl flex items-center justify-center font-display text-2xl text-white"
      style={{
        background: tone === "pink" ? "var(--brand-pink)" : "var(--brand-blue)",
        color: tone === "pink" ? "white" : "var(--brand-ink)",
        boxShadow:
          tone === "pink"
            ? "0 0 18px -6px rgba(221,13,168,0.55)"
            : "0 0 18px -6px rgba(79,213,255,0.45)",
      }}
    >
      {value}
    </div>
  );
}
