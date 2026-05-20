import { useState, useEffect, useRef } from "react";
import type { PokemonCardData } from "@/components/overlay/PokemonCard";
import { getPokemonData } from "@/lib/pokemon-data";

/**
 * usePokemonTeam
 *
 * Hook que recebe um time base (mock ou externo) e o enriquece
 * de forma assíncrona com:
 *  - Sprites oficiais da PokéAPI
 *  - Top moves e top items do Smogon Stats (se não fornecidos no dado base)
 *  - Abilities do Smogon Stats (se não fornecidas)
 *
 * Regras:
 *  - Dados fornecidos manualmente no `baseTeam` têm prioridade sobre Smogon.
 *  - Sprite é sempre buscado da PokéAPI (vem de graça e é mais atualizado).
 *  - Nunca bloqueia a renderização: o time base aparece imediatamente,
 *    os dados enriquecidos chegam em background.
 *
 * Feature flag: controlled by VITE_POKEMON_DATA_ENABLED in pokemon-data.ts
 */
export function usePokemonTeam(baseTeam: PokemonCardData[]) {
  const [team, setTeam] = useState<PokemonCardData[]>(baseTeam);
  // Store fetched/enriched data to avoid losing it when other properties change
  const enrichedCacheRef = useRef<Record<string, Partial<PokemonCardData>>>({});

  // Serialize relevant parts of baseTeam to trigger useEffect when any value changes
  const serializedBaseTeam = JSON.stringify(
    baseTeam.map((p) => ({
      name: p.name,
      active: p.active,
      status: p.status,
      fainted: p.fainted,
      item: p.item,
      moves: p.moves,
      abilities: p.abilities,
    }))
  );

  useEffect(() => {
    let cancelled = false;

    // Instantly merge baseTeam with whatever we have cached to prevent blinks
    const initialMerged = baseTeam.map((poke) => {
      const cached = enrichedCacheRef.current[poke.name] || {};
      return {
        ...poke,
        sprite: cached.sprite || poke.sprite,
        types: cached.types && cached.types.length > 0 ? cached.types : (poke.types && poke.types.length > 0 ? poke.types : ["Normal"]),
        moves: poke.moves && poke.moves.length >= 2 ? poke.moves : (cached.moves || poke.moves),
        item: poke.item || cached.item || poke.item,
        abilities: poke.abilities && poke.abilities.length > 0 ? poke.abilities : (cached.abilities || poke.abilities),
      };
    });
    setTeam(initialMerged);

    async function enrichAll() {
      let needsStateUpdate = false;

      // Filter and fetch for any Pokémon whose name isn't already cached
      const promises = baseTeam.map(async (poke) => {
        // Skip if empty name or already in cache
        if (!poke.name || enrichedCacheRef.current[poke.name]) return;

        try {
          const { sprite, stats } = await getPokemonData(poke.name);
          enrichedCacheRef.current[poke.name] = {
            sprite: sprite.official || undefined,
            types: sprite.types && sprite.types.length > 0 ? sprite.types : (stats?.types || []),
            moves: stats?.topMoves?.slice(0, 4) || [],
            item: stats?.topItems?.[0] || undefined,
            abilities: stats?.topAbilities?.slice(0, 2) || [],
          };
          needsStateUpdate = true;
        } catch (err) {
          console.warn(`[usePokemonTeam] failed to enrich ${poke.name}:`, err);
        }
      });

      await Promise.allSettled(promises);

      if (!cancelled && needsStateUpdate) {
        // Re-construct the fully enriched team from the latest baseTeam and caches
        const fullyEnriched = baseTeam.map((poke) => {
          const cached = enrichedCacheRef.current[poke.name] || {};
          return {
            ...poke,
            sprite: cached.sprite || poke.sprite,
            types: cached.types && cached.types.length > 0 ? cached.types : (poke.types && poke.types.length > 0 ? poke.types : ["Normal"]),
            moves: poke.moves && poke.moves.length >= 2 ? poke.moves : (cached.moves || poke.moves),
            item: poke.item || cached.item || poke.item,
            abilities: poke.abilities && poke.abilities.length > 0 ? poke.abilities : (cached.abilities || poke.abilities),
          };
        });
        setTeam(fullyEnriched);
      }
    }

    enrichAll();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedBaseTeam]);

  return team;
}
