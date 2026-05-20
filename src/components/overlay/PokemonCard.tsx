import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

/**
 * Dados do card — otimizados para VGC overlay.
 *
 * ✅ Exibidos:  nome, sprite, tipos, item, moves, abilities, status
 * ❌ Removidos: HP/hpCurrent/hpMax — irrelevante para análise VGC
 * ❌ Removido:  estado visual de "derrotado" — todos os slots são uniformes
 */
export interface PokemonCardData {
  name: string;
  types: PokemonType[];
  sprite?: string;
  item?: string;
  moves?: string[];
  abilities?: string[];
  status?: PokemonStatus;
  active?: boolean;
  /** @deprecated — mantido para compatibilidade, mas não tem efeito visual */
  fainted?: boolean;
}

// ─── Tabelas de cor ──────────────────────────────────────────────────────────

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
  fnt: "#555",
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function PokemonCard({
  data,
  mirror = false,
  className,
}: {
  data: PokemonCardData;
  mirror?: boolean;
  className?: string;
}) {
  // Top 4 moves exibidos um por linha
  const topMoves = (data.moves ?? []).slice(0, 4);
  const topAbility = (data.abilities ?? []).slice(0, 1);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden rounded-2xl border border-white/10",
        "bg-[color:var(--surface-elevated)]",
        "flex items-stretch transition-all duration-200",
        data.active && "border-white/20",
        className,
      )}
      style={
        data.active
          ? {
              boxShadow: mirror
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
            mirror ? "right-0 bg-[color:var(--brand-blue)]" : "left-0 bg-[color:var(--brand-pink)]",
          )}
        />
      )}

      {/* ── Layout horizontal: sprite | info ── */}
      <div className={cn("flex w-full h-full", mirror && "flex-row-reverse")}>
        {/* ── Sprite — tamanho aumentado para 88px ── */}
        <div className="flex-shrink-0 flex items-center justify-center p-2 pl-3">
          <div className="w-[88px] h-[88px] rounded-xl bg-black/25 flex items-center justify-center overflow-hidden">
            {data.sprite ? (
              <img
                src={data.sprite}
                alt={data.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback: oculta img quebrada e mostra "?" via sibling
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fb = parent.querySelector(".sprite-fallback");
                    if (fb) (fb as HTMLElement).style.display = "flex";
                  }
                }}
              />
            ) : null}
            <span
              className="sprite-fallback font-display text-2xl text-white/30 items-center justify-center"
              style={{ display: data.sprite ? "none" : "flex" }}
            >
              ?
            </span>
          </div>
        </div>

        {/* ── Info ── */}
        <div
          className={cn(
            "flex-1 min-w-0 flex flex-col justify-center gap-1.5 px-3 py-1.5",
            mirror && "items-end text-right",
          )}
        >
          {/* Nome + status */}
          <div className={cn("flex items-center gap-1.5 flex-wrap", mirror && "flex-row-reverse")}>
            <span
              className="font-heading text-[15px] text-white truncate leading-tight tracking-wide"
              style={{
                textShadow: "1px 1.5px 0px var(--brand-pink), -1px -1.5px 0px var(--brand-blue)",
              }}
            >
              {data.name}
            </span>
            {data.status && data.status !== "none" && (
              <span
                className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md text-white flex-shrink-0"
                style={{ background: STATUS_COLOR[data.status] }}
              >
                {STATUS_LABEL[data.status]}
              </span>
            )}
          </div>

          {/* Tipos + item */}
          <div className={cn("flex flex-wrap items-center gap-1.5", mirror && "flex-row-reverse")}>
            {data.types.map((t) => (
              <span
                key={t}
                className="text-[9.5px] font-semibold uppercase tracking-wide px-1.5 py-[2px] rounded-md text-white"
                style={{ background: TYPE_COLORS[t] }}
              >
                {t}
              </span>
            ))}
            {data.item && (
              <span className="text-[10.5px] text-white/70 truncate max-w-[130px]">
                🎒 {data.item}
              </span>
            )}
          </div>

          {/* Habilidade */}
          {topAbility.length > 0 && (
            <div className={cn("flex items-center gap-1", mirror && "flex-row-reverse")}>
              <span className="text-[10.5px] text-[color:var(--brand-blue)] opacity-95 truncate font-medium">
                ✦ {topAbility[0]}
              </span>
            </div>
          )}

          {/* Moves — Barra cinza claro com borda fina degradê de rosa a azul */}
          {topMoves.length > 0 && (
            <div className="flex flex-col gap-0.5 w-full">
              {topMoves.map((move, i) => (
                <div
                  key={i}
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(221, 13, 168, 0.25) 0%, rgba(0, 0, 0, 0.85) 50%, rgba(79, 213, 255, 0.25) 100%) padding-box, linear-gradient(90deg, var(--brand-pink), var(--brand-blue)) border-box",
                    border: "1px solid transparent",
                  }}
                  className="w-full text-[10.5px] text-white/95 px-2 py-[2px] rounded-md truncate text-center leading-tight font-semibold tracking-wide uppercase"
                >
                  {move.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
