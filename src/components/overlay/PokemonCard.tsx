import { cn } from "@/lib/utils";

export type PokemonStatus = "none" | "par" | "brn" | "psn" | "slp" | "frz" | "fnt";
export type PokemonType =
  | "Normal"
  | "Fire"
  | "Water"
  | "Electric"
  | "Grass"
  | "Ice"
  | "Fighting"
  | "Poison"
  | "Ground"
  | "Flying"
  | "Psychic"
  | "Bug"
  | "Rock"
  | "Ghost"
  | "Dragon"
  | "Dark"
  | "Steel"
  | "Fairy";

export interface PokemonCardData {
  name: string;
  hpCurrent: number;
  hpMax: number;
  types: PokemonType[];
  status?: PokemonStatus;
  item?: string;
  active?: boolean;
  fainted?: boolean;
  sprite?: string;
}

const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: "#A8A77A",
  Fire: "#EE8130",
  Water: "#6390F0",
  Electric: "#F7D02C",
  Grass: "#7AC74C",
  Ice: "#96D9D6",
  Fighting: "#C22E28",
  Poison: "#A33EA1",
  Ground: "#E2BF65",
  Flying: "#A98FF3",
  Psychic: "#F95587",
  Bug: "#A6B91A",
  Rock: "#B6A136",
  Ghost: "#735797",
  Dragon: "#6F35FC",
  Dark: "#705746",
  Steel: "#B7B7CE",
  Fairy: "#D685AD",
};

const STATUS_LABEL: Record<PokemonStatus, string> = {
  none: "",
  par: "PAR",
  brn: "BRN",
  psn: "PSN",
  slp: "SLP",
  frz: "FRZ",
  fnt: "FNT",
};

const STATUS_COLOR: Record<PokemonStatus, string> = {
  none: "transparent",
  par: "#F7D02C",
  brn: "#EE8130",
  psn: "#A33EA1",
  slp: "#888",
  frz: "#96D9D6",
  fnt: "#444",
};

export function PokemonCard({
  data,
  mirror = false,
  className,
}: {
  data: PokemonCardData;
  mirror?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (data.hpCurrent / data.hpMax) * 100));
  const hpColor = pct > 50 ? "#5BD17A" : pct > 20 ? "#F5C24A" : "#E5484D";
  const dim = data.fainted ? "opacity-40 grayscale" : "opacity-100";

  return (
    <div
      className={cn(
        // Tamanho fixo garantido por h-full no wrapper + flex interno
        "relative w-full h-full overflow-hidden rounded-2xl border border-white/10",
        "bg-[color:var(--surface-elevated)]",
        "flex items-stretch gap-0 transition-all duration-200",
        data.active && "border-white/20",
        dim,
        className,
      )}
      style={
        data.active
          ? {
              boxShadow:
                mirror
                  ? "0 0 0 1px rgba(79,213,255,0.18), inset 0 0 20px -10px rgba(79,213,255,0.08)"
                  : "0 0 0 1px rgba(221,13,168,0.18), inset 0 0 20px -10px rgba(221,13,168,0.08)",
            }
          : undefined
      }
    >
      {/* Barra de ativo (esquerda ou direita) */}
      {data.active && (
        <span
          className={cn(
            "absolute top-2 bottom-2 w-1 rounded-full",
            mirror
              ? "right-0 bg-[color:var(--brand-blue)]"
              : "left-0 bg-[color:var(--brand-pink)]",
          )}
        />
      )}

      {/* Layout horizontal: sprite | info */}
      <div className={cn("flex w-full h-full", mirror && "flex-row-reverse")}>
        {/* Sprite */}
        <div className="flex-shrink-0 flex items-center justify-center p-2 pl-4">
          <div className="w-[72px] h-[72px] rounded-xl bg-black/30 flex items-center justify-center overflow-hidden">
            {data.sprite ? (
              <img
                src={data.sprite}
                alt={data.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="font-display text-2xl text-white/30">?</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div
          className={cn(
            "flex-1 min-w-0 flex flex-col justify-center gap-1.5 px-3 py-2",
            mirror && "items-end text-right",
          )}
        >
          {/* Nome + status */}
          <div className={cn("flex items-center gap-1.5 flex-wrap", mirror && "flex-row-reverse")}>
            <span className="font-heading text-[12px] text-white truncate leading-tight">
              {data.name}
            </span>
            {data.status && data.status !== "none" && (
              <span
                className="text-[8px] font-bold px-1.5 py-0.5 rounded-md text-white flex-shrink-0"
                style={{ background: STATUS_COLOR[data.status] }}
              >
                {STATUS_LABEL[data.status]}
              </span>
            )}
          </div>

          {/* Barra de HP */}
          <div className="w-full">
            <div className="h-[5px] w-full rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, background: hpColor }}
              />
            </div>
            <div
              className={cn(
                "flex items-center justify-between mt-0.5",
                mirror && "flex-row-reverse",
              )}
            >
              <span className="font-mono text-[9px] text-white/50">
                {data.hpCurrent}/{data.hpMax}
              </span>
              <span
                className="font-mono text-[9px] font-semibold"
                style={{ color: hpColor }}
              >
                {Math.round(pct)}%
              </span>
            </div>
          </div>

          {/* Tipos + item */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-1",
              mirror && "flex-row-reverse",
            )}
          >
            {data.types.map((t) => (
              <span
                key={t}
                className="text-[8px] font-semibold uppercase tracking-wide px-1.5 py-[2px] rounded-md text-white"
                style={{ background: TYPE_COLORS[t] }}
              >
                {t}
              </span>
            ))}
            {data.item && (
              <span className="text-[9px] text-white/50 truncate max-w-[80px]">
                {data.item}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
