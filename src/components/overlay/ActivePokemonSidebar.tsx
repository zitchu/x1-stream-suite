import type { PokemonCardData } from "./PokemonCard";

const TYPE_COLORS: Record<string, string> = {
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

function formatPokemonName(name: string) {
  return name.replace(/-/g, " ").toUpperCase();
}

export function ActivePokemonSidebar({
  team,
  side,
}: {
  team: PokemonCardData[];
  side: "left" | "right";
}) {
  const activePokemons = team.filter((p) => p.active && p.name).slice(0, 2);
  if (activePokemons.length === 0) return null;

  return (
    <div
      className={`pointer-events-none absolute bottom-16 ${
        side === "left" ? "left-4" : "right-4"
      } hidden lg:block`}
    >
      <div className="w-[180px] space-y-2 rounded-[1.8rem] border border-white/10 bg-black/60 p-3 text-white/90 shadow-xl backdrop-blur-sm">
        <span
          className={`font-heading text-[12px] tracking-[0.3em] uppercase ${
            side === "left" ? "text-[color:var(--brand-pink)]" : "text-[color:var(--brand-blue)]"
          }`}
          style={{ textShadow: "0 0 2px rgba(0,0,0,1)" }}
        >
          ativos
        </span>
        {activePokemons.map((poke, index) => (
          <div
            key={`${poke.name}-${index}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/90"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold">
              {formatPokemonName(poke.name)}
            </div>
            {poke.types?.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {poke.types.map((type) => (
                  <span
                    key={type}
                    style={{ background: TYPE_COLORS[type] ?? "rgba(255,255,255,0.08)" }}
                    className="text-[9px] uppercase tracking-[0.2em] rounded-full px-2 py-1 text-white"
                  >
                    {type}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
