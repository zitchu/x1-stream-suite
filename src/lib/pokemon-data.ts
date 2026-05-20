/**
 * pokemon-data.ts
 *
 * Helper para overlay de Pokémon VGC.
 *
 * Fontes de dados:
 *  1. PokéAPI — sprites oficiais
 *  2. Smogon Stats JSON (VGC 2025 Reg G) — usage%, top_items, top_moves, ev_spreads
 *
 * Cache:
 *  - Sprites: localStorage (permanente por versão de URL)
 *  - Smogon Stats: memória (TTL 5 min dentro da sessão)
 *
 * Feature Flag: VITE_POKEMON_DATA_ENABLED (default: true)
 * Para desligar, defina VITE_POKEMON_DATA_ENABLED=false no .env
 */

// ─── Config ───────────────────────────────────────────────────────────────────

const ENABLED =
  typeof import.meta !== "undefined" &&
  (import.meta as Record<string, unknown>).env
    ? (import.meta as { env: Record<string, string> }).env
        .VITE_POKEMON_DATA_ENABLED !== "false"
    : true;

const POKEAPI_BASE = "https://pokeapi.co/api/v2/pokemon";

// Smogon Stats: Gen9 VGC 2025 Reg G (Rating ≥ 1760)
const SMOGON_STATS_URL =
  "https://www.smogon.com/stats/2025-01/gen9vgc2025regg-1760.json";

const SMOGON_TTL_MS = 5 * 60 * 1000; // 5 minutos

// ─── Tipos ────────────────────────────────────────────────────────────────────

import type { PokemonType } from "@/components/overlay/PokemonCard";

export interface PokemonSprite {
  official: string | null;
  shiny: string | null;
  types?: PokemonType[];
}

export interface SmogonPokemonStats {
  usagePct: number;           // % de uso no formato
  topMoves: string[];         // top 5 moves mais usados
  topItems: string[];         // top 5 itens mais usados
  topAbilities: string[];     // top 5 habilidades
  topSpreads: string[];       // top 3 EVs spreads (ex: "Modest 252/0/4/252/0/0")
}

// ─── Cache em memória para Smogon Stats ──────────────────────────────────────

let _smogonCache: {
  data: Record<string, SmogonPokemonStats>;
  expiresAt: number;
} | null = null;

// ─── Normalização de nome ─────────────────────────────────────────────────────

/**
 * Tabela de overrides para slugs da PokéAPI.
 * Cobre formas especiais do VGC competitivo que têm nomes diferentes
 * na API em relação ao uso comum nos overlays/Smogon.
 */
const SLUG_OVERRIDES: Record<string, string> = {
  // ── Calyrex (slugs reais da PokéAPI — sem sufixo -rider)
  "calyrex-shadow":          "calyrex-shadow",
  "calyrex-s":               "calyrex-shadow",
  "calyrex-shadow-rider":    "calyrex-shadow",
  "calyrex-ice":             "calyrex-ice",
  "calyrex-i":               "calyrex-ice",
  "calyrex-ice-rider":       "calyrex-ice",
  // ── Tornadus (forma Incarnate é o padrão VGC)
  "tornadus":                "tornadus-incarnate",
  "tornadus-i":              "tornadus-incarnate",
  "tornadus-t":              "tornadus-therian",
  "tornadus-therian":        "tornadus-therian",
  // ── Urshifu (VGC padrão = Single Strike)
  "urshifu":                 "urshifu-single-strike",
  "urshifu-rs":              "urshifu-rapid-strike",
  "urshifu-rapid":           "urshifu-rapid-strike",
  "urshifu-single":          "urshifu-single-strike",
  // ── Ogerpon
  "ogerpon":                 "ogerpon",
  "ogerpon-cornerstone":     "ogerpon-cornerstone-mask",
  "ogerpon-hearthflame":     "ogerpon-hearthflame-mask",
  "ogerpon-wellspring":      "ogerpon-wellspring-mask",
  // ── Terapagos
  "terapagos":               "terapagos-normal",
  // ── Zacian / Zamazenta
  "zacian":                  "zacian-crowned",
  "zamazenta":               "zamazenta-crowned",
  // ── Eternatus (slug correto, mas entra por segurança)
  "eternatus":               "eternatus",
  // ── Kyogre / Groudon (slugs simples funcionam)
  "kyogre":                  "kyogre",
  "groudon":                 "groudon",
  // ── Necrozma
  "necrozma-dusk-mane":      "necrozma-dusk-mane",
  "necrozma-dawn-wings":     "necrozma-dawn-wings",
  "necrozma-ultra":          "necrozma-ultra",
  // ── Miraidon / Koraidon
  "miraidon":                "miraidon",
  "koraidon":                "koraidon",
  // ── Paradox Mon (nomes com espaço)
  "flutter-mane":            "flutter-mane",
  "iron-hands":              "iron-hands",
  "iron-bundle":             "iron-bundle",
  "iron-valiant":            "iron-valiant",
  "iron-leaves":             "iron-leaves",
  "iron-moth":               "iron-moth",
  "great-tusk":              "great-tusk",
  "roaring-moon":            "roaring-moon",
  "walking-wake":            "walking-wake",
  "gouging-fire":            "gouging-fire",
  "raging-bolt":             "raging-bolt",
};

/** Converte nome do overlay para slug da PokéAPI com fallback robusto. */
function toApiSlug(name: string): string {
  const raw = name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return SLUG_OVERRIDES[raw] ?? raw;
}

/** Converte slug da PokéAPI para nome canônico do Smogon Stats. */
function toSmogonName(name: string): string {
  // O JSON do Smogon usa Title Case com formas específicas
  // Tenta o mapeamento direto; se não existir, usa o nome original com Title Case
  const overrides: Record<string, string> = {
    "flutter-mane": "Flutter Mane",
    "iron-hands": "Iron Hands",
    "iron-bundle": "Iron Bundle",
    "iron-valiant": "Iron Valiant",
    "great-tusk": "Great Tusk",
    "calyrex-shadow-rider": "Calyrex-Shadow",
    "calyrex-ice-rider": "Calyrex-Ice",
    "urshifu-rapid-strike": "Urshifu-Rapid-Strike",
    urshifu: "Urshifu",
    miraidon: "Miraidon",
    "flutter mane": "Flutter Mane",
  };
  const slug = toApiSlug(name);
  if (overrides[slug]) return overrides[slug];
  // Title Case genérico
  return name
    .split(/[-\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ─── PokéAPI: Sprite ──────────────────────────────────────────────────────────

const SPRITE_CACHE_KEY = (slug: string) => `pkmn_sprite_v5_${slug}`;

/** Busca sprite oficial do Pokémon pela PokéAPI. Cacheia em localStorage. */
export async function getPokemonSprite(name: string): Promise<PokemonSprite> {
  if (!ENABLED) return { official: null, shiny: null };

  const slug = toApiSlug(name);
  const cacheKey = SPRITE_CACHE_KEY(slug);

  // Verifica cache localStorage
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as PokemonSprite;
    }
  } catch {
    // localStorage pode falhar em contextos OBS restritos — continua sem cache
  }

  try {
    const res = await fetch(`${POKEAPI_BASE}/${slug}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`PokéAPI ${res.status} for ${slug}`);

    const json = (await res.json()) as {
      sprites: {
        other?: {
          "official-artwork"?: { front_default?: string; front_shiny?: string };
          home?: { front_default?: string; front_shiny?: string };
        };
        front_default?: string;
      };
      types?: { slot: number; type: { name: string } }[];
    };

    const sprite: PokemonSprite = {
      official:
        json.sprites?.other?.["official-artwork"]?.front_default ??
        json.sprites?.other?.home?.front_default ??
        json.sprites?.front_default ??
        null,
      shiny:
        json.sprites?.other?.["official-artwork"]?.front_shiny ??
        json.sprites?.other?.home?.front_shiny ??
        null,
      types: Array.isArray(json.types)
        ? json.types.map((t) => {
            const n = t.type.name;
            return (n.charAt(0).toUpperCase() + n.slice(1)) as PokemonType;
          })
        : [],
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(sprite));
    } catch {
      // ignora falha de escrita no cache
    }

    return sprite;
  } catch (err) {
    console.warn(`[pokemon-data] sprite fetch failed for "${name}":`, err);
    return { official: null, shiny: null };
  }
}

// ─── Smogon Stats ─────────────────────────────────────────────────────────────

/** Carrega e cacheia o JSON completo do Smogon Stats. */
async function loadSmogonStats(): Promise<Record<string, SmogonPokemonStats>> {
  const now = Date.now();
  if (_smogonCache && now < _smogonCache.expiresAt) {
    return _smogonCache.data;
  }

  try {
    const res = await fetch(SMOGON_STATS_URL, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Smogon stats HTTP ${res.status}`);

    // O JSON do Smogon tem formato:
    // { "info": {...}, "data": { "Miraidon": { "Raw count": 1234, "Abilities": {...}, "Items": {...}, "Spreads": {...}, "Moves": {...}, "usage": 0.34 }, ... } }
    const json = (await res.json()) as {
      data: Record<
        string,
        {
          usage?: number;
          Abilities?: Record<string, number>;
          Items?: Record<string, number>;
          Moves?: Record<string, number>;
          Spreads?: Record<string, number>;
        }
      >;
    };

    const parsed: Record<string, SmogonPokemonStats> = {};

    for (const [pokeName, stats] of Object.entries(json.data ?? {})) {
      const topN = (obj: Record<string, number> | undefined, n = 5) =>
        Object.entries(obj ?? {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, n)
          .map(([k]) => k)
          .filter((k) => k !== "Nothing" && k !== "nothing" && k !== "");

      parsed[pokeName] = {
        usagePct: (stats.usage ?? 0) * 100,
        topMoves: topN(stats.Moves, 5),
        topItems: topN(stats.Items, 5),
        topAbilities: topN(stats.Abilities, 5),
        topSpreads: topN(stats.Spreads, 3),
      };
    }

    _smogonCache = { data: parsed, expiresAt: now + SMOGON_TTL_MS };
    return parsed;
  } catch (err) {
    console.warn("[pokemon-data] Smogon stats fetch failed:", err);
    return _smogonCache?.data ?? {};
  }
}

/** Busca stats do Smogon para um Pokémon específico. */
export async function getSmogonStats(
  name: string,
): Promise<SmogonPokemonStats | null> {
  if (!ENABLED) return null;

  const all = await loadSmogonStats();
  const smogonName = toSmogonName(name);

  // Busca exata
  if (all[smogonName]) return all[smogonName];

  // Busca tolerante (case-insensitive)
  const lower = smogonName.toLowerCase();
  const found = Object.keys(all).find((k) => k.toLowerCase() === lower);
  if (found) return all[found];

  return null;
}

/**
 * Combina sprite + Smogon stats para um Pokémon.
 * Retorna ambos em paralelo para máxima performance.
 */
export async function getPokemonData(name: string): Promise<{
  sprite: PokemonSprite;
  stats: SmogonPokemonStats | null;
}> {
  const [sprite, stats] = await Promise.all([
    getPokemonSprite(name),
    getSmogonStats(name),
  ]);
  return { sprite, stats };
}
