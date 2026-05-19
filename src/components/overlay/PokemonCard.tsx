import { cn } from "@/lib/utils";

export type PokemonStatus = "none" | "par" | "brn" | "psn" | "slp" | "frz" | "fnt";
export type PokemonType =
  | "Normal" | "Fire" | "Water" | "Electric" | "Grass" | "Ice"
  | "Fighting" | "Poison" | "Ground" | "Flying" | "Psychic" | "Bug"
  | "Rock" | "Ghost" | "Dragon" | "Dark" | "Steel" | "Fairy";

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
  Normal: "#A8A77A", Fire: "#EE8130", Water: "#6390F0", Electric: "#F7D02C",
  Grass: "#7AC74C", Ice: "#96D9D6", Fighting: "#C22E28", Poison: "#A33EA1",
  Ground: "#E2BF65", Flying: "#A98FF3", Psychic: "#F95587", Bug: "#A6B91A",
  Rock: "#B6A136", Ghost: "#735797", Dragon: "#6F35FC", Dark: "#705746",
  Steel: "#B7B7CE", Fairy: "#D685AD",
};

const STATUS_LABEL: Record<PokemonStatus, string> = {
  none: "", par: "PAR", brn: "BRN", psn: "PSN", slp: "SLP", frz: "FRZ", fnt: "FNT",
};

export function PokemonCard({ data, mirror = false }: { data: PokemonCardData; mirror?: boolean }) {
  const pct = Math.max(0, Math.min(100, (data.hpCurrent / data.hpMax) * 100));
  const hpColor = pct > 50 ? "#5BD17A" : pct > 20 ? "#F5C24A" : "#E5484D";
  const dim = data.fainted ? "opacity-40 grayscale" : "opacity-100";

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-[color:var(--surface)] backdrop-blur-md ring-brand edge-brand",
        "px-3 py-2.5 flex items-center gap-3 transition-all",
        data.active && "ring-2 ring-[color:var(--brand-pink)]",
        dim,
        mirror && "flex-row-reverse text-right",
      )}
    >
      {/* Sprite slot */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center overflow-hidden">
        {data.sprite ? (
          <img src={data.sprite} alt={data.name} className="w-full h-full object-contain" />
        ) : (
          <span className="font-display text-lg text-white/40">?</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={cn("flex items-center gap-2 mb-1", mirror && "flex-row-reverse")}>
          <span className="font-heading text-[13px] text-white truncate">{data.name}</span>
          {data.status && data.status !== "none" && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white"
              style={{
                background:
                  data.status === "fnt" ? "#444"
                    : data.status === "brn" ? "#EE8130"
                    : data.status === "par" ? "#F7D02C"
                    : data.status === "psn" ? "#A33EA1"
                    : data.status === "frz" ? "#96D9D6"
                    : "#888",
              }}
            >
              {STATUS_LABEL[data.status]}
            </span>
          )}
        </div>

        {/* HP bar */}
        <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: hpColor }}
          />
        </div>

        <div className={cn("flex items-center gap-1.5 mt-1.5", mirror && "flex-row-reverse")}>
          {data.types.map((t) => (
            <span
              key={t}
              className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white"
              style={{ background: TYPE_COLORS[t] }}
            >
              {t}
            </span>
          ))}
          {data.item && (
            <span className="text-[9px] text-white/60 truncate">@ {data.item}</span>
          )}
        </div>
      </div>
    </div>
  );
}
