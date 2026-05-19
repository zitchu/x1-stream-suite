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
        "w-full flex items-stretch gap-3 rounded-2xl bg-[color:var(--surface)] backdrop-blur-md ring-brand edge-brand overflow-hidden",
        className,
      )}
    >
      {/* Left player */}
      <PlayerSlot p={left} align="left" />

      {/* Center: logo + score + meta */}
      <div className="flex items-center gap-4 px-5 py-2 bg-black/30">
        <div className="flex items-center gap-3">
          <ScoreBlock value={left.score} tone="pink" />
          <BrandLogo className="min-w-[88px] min-h-[44px] px-3 py-1.5" />
          <ScoreBlock value={right.score} tone="blue" />
        </div>
        <div className="flex flex-col items-center leading-tight">
          <span className="font-heading text-[10px] tracking-[0.2em] text-white/70">
            {round}
          </span>
          <span className="font-display text-lg text-white">{format}</span>
          <span className="font-mono text-[11px] text-[color:var(--brand-blue)]">{timer}</span>
        </div>
      </div>

      {/* Right player */}
      <PlayerSlot p={right} align="right" />
    </div>
  );
}

function PlayerSlot({ p, align }: { p: PlayerInfo; align: "left" | "right" }) {
  return (
    <div
      className={cn(
        "flex-1 flex items-center gap-3 px-5 py-3",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      <div
        className={cn(
          "w-1.5 self-stretch rounded-full",
          align === "left" ? "bg-[color:var(--brand-pink)]" : "bg-[color:var(--brand-blue)]",
        )}
      />
      <div className="flex flex-col leading-tight min-w-0">
        {p.tag && (
          <span className="font-heading text-[10px] tracking-[0.2em] text-white/60 truncate">
            {p.tag}
          </span>
        )}
        <span className="font-display text-2xl text-white truncate">{p.name}</span>
        {p.country && (
          <span className="text-[11px] text-white/50">{p.country}</span>
        )}
      </div>
    </div>
  );
}

function ScoreBlock({ value, tone }: { value: number; tone: "pink" | "blue" }) {
  return (
    <div
      className="min-w-[44px] h-11 rounded-xl flex items-center justify-center font-display text-3xl text-white"
      style={{
        background: tone === "pink" ? "var(--brand-pink)" : "var(--brand-blue)",
        color: tone === "pink" ? "white" : "var(--brand-ink)",
      }}
    >
      {value}
    </div>
  );
}
