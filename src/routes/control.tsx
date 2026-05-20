import { createFileRoute, Link } from "@tanstack/react-router";
import { useStreamState } from "@/hooks/useStreamState";
import { BrandLogo } from "@/components/overlay/BrandLogo";
import type { PokemonCardData } from "@/components/overlay/PokemonCard";
import { getSmogonStats } from "@/lib/pokemon-data";
import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from "react";

export const Route = createFileRoute("/control")({
  head: () => ({
    meta: [
      { title: "X1? — Painel de Controle" },
      {
        name: "description",
        content: "Painel de controle ao vivo para overlays e HUDs de Pokémon.",
      },
    ],
  }),
  component: ControlPanel,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface PokeListEntry {
  name: string; // slug lowercase ex: "flutter-mane"
  id: number; // Pokédex number
}

// ─── Hook: lista global de Pokémon (único fetch por sessão) ───────────────────

const SESSION_KEY = "x1-poke-list-v1";

function usePokemonList() {
  const [list, setList] = useState<PokeListEntry[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta sessionStorage primeiro
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) {
        setList(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    let cancelled = false;
    setLoading(true);

    fetch("https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0", {
      signal: AbortSignal.timeout(10000),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { results: { name: string; url: string }[] }) => {
        if (cancelled) return;
        const entries: PokeListEntry[] = data.results.map((p) => {
          // Extrai o ID do final da URL: ".../pokemon/6/" → 6
          const parts = p.url.replace(/\/$/, "").split("/");
          const id = parseInt(parts[parts.length - 1], 10) || 0;
          return { name: p.name, id };
        });
        setList(entries);
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(entries));
        } catch {
          // ignore quota errors
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { list, loading, error };
}

// ─── Helper: Sprite URL com fallback robusto ──────────────────────────────────

function getSpriteUrl(pokemonSlug: string): string {
  // PokemonDB sprite: geralmente mais completo
  return `https://img.pokemondb.net/sprites/home/normal/${pokemonSlug}.png`;
}

// ─── Helper: Formata nome de move para exibição ──────────────────────────────

function formatMoveName(move: string): string {
  if (move === "--") return "--";
  return move
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface PokemonMetadata {
  moves: string[];
  abilities: string[];
  item: string;
}

async function fetchPokemonMetadata(slug: string): Promise<PokemonMetadata> {
  // 1. Tenta o wrapper FastAPI local (ordenado por uso VGC)
  try {
    const res = await fetch(`/pokemon/${slug}/stats`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      const moves = Array.isArray(data.moves) ? (data.moves as string[]) : [];
      const abilities = Array.isArray(data.abilities)
        ? (data.abilities as string[])
        : Array.isArray(data.topAbilities)
          ? (data.topAbilities as string[])
          : [];
      const item = Array.isArray(data.topItems)
        ? String(data.topItems[0] ?? "")
        : typeof data.item === "string"
          ? data.item
          : "";
      if (moves.length > 0) {
        return {
          moves,
          abilities,
          item,
        };
      }
    }
  } catch {
    // wrapper indisponível — segue para fallback
  }

  // 2. Tenta Smogon Stats diretamente se o wrapper não estiver disponível
  try {
    const smogonStats = await getSmogonStats(slug);
    if (smogonStats) {
      return {
        moves: smogonStats.topMoves,
        abilities: smogonStats.topAbilities,
        item: smogonStats.topItems[0] ?? "",
      };
    }
  } catch (err) {
    console.warn(`Erro ao buscar Smogon stats para ${slug}:`, err);
  }

  // 3. Fallback: PokéAPI
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`PokéAPI HTTP ${res.status}`);
    const data = await res.json();
    const moves: string[] = (data.moves as { move: { name: string } }[])
      .map((m) => m.move.name)
      .sort((a, b) => a.localeCompare(b));
    const abilities: string[] = (data.abilities as { ability: { name: string } }[]).map(
      (a) => a.ability.name,
    );
    return {
      moves,
      abilities,
      item: "",
    };
  } catch (err) {
    console.warn(`Erro ao buscar metadata para ${slug}:`, err);
    return {
      moves: [],
      abilities: [],
      item: "",
    };
  }
}

// ─── Componente: Autocomplete de Pokémon ─────────────────────────────────────

function PokemonAutocomplete({
  value,
  list,
  listLoading,
  listError,
  onSelect,
  inputClassName,
}: {
  value: string;
  list: PokeListEntry[];
  listLoading: boolean;
  listError: boolean;
  onSelect: (slug: string) => void;
  inputClassName?: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza query com valor externo quando muda por broadcast
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const suggestions = useCallback((): PokeListEntry[] => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase().trim();
    const numQ = q.replace(/^#/, ""); // suporte a "#249"

    return list
      .filter((p) => {
        const matchName = p.name.includes(q);
        const matchId = /^\d+$/.test(numQ) && String(p.id).includes(numQ);
        return matchName || matchId;
      })
      .slice(0, 10);
  }, [query, list]);

  const suggs = suggestions();

  const handleSelect = (entry: PokeListEntry) => {
    setQuery(entry.name);
    setOpen(false);
    onSelect(entry.name);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggs.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        // Confirma digitação manual
        onSelect(query.trim().toLowerCase().replace(/\s+/g, "-"));
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggs.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(suggs[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {listError && (
        <p className="text-[9px] text-amber-400/70 mb-0.5">
          dados indisponíveis — use digitação manual
        </p>
      )}
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder={listLoading ? "Carregando lista…" : "Ex: Miraidon, Flutter Mane, #249"}
        className={inputClassName}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlighted(0);
          setOpen(true);
        }}
        onFocus={() => query.length >= 1 && setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && suggs.length > 0 && (
        <ul
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-2xl border border-white/10"
          style={{ background: "rgba(18,12,26,0.98)" }}
        >
          {suggs.map((entry, i) => {
            const idStr = String(entry.id).padStart(3, "0");
            const spriteUrl = getSpriteUrl(entry.name);
            const label = entry.name
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join("-");
            return (
              <li
                key={entry.id}
                className={`flex items-center gap-2.5 px-3 py-1.5 cursor-pointer text-xs transition-colors ${
                  i === highlighted ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(entry);
                }}
                onMouseEnter={() => setHighlighted(i)}
              >
                <img
                  src={spriteUrl}
                  alt={entry.name}
                  className="w-8 h-8 object-contain flex-shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
                <span className="text-white/40 font-mono text-[10px] w-8 flex-shrink-0">
                  #{idStr}
                </span>
                <span className="truncate font-medium">{label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Componente: Dropdown de Golpe com busca interna ─────────────────────────

function MoveDropdown({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered =
    search.trim().length === 0
      ? options
      : options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Quando abre, foca no campo de busca
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const displayLabel = (v: string) => formatMoveName(v);

  if (options.length === 0) {
    // Sem opções carregadas: input livre
    return (
      <input
        type="text"
        value={value === "--" ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/45 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:border-white/20"
        placeholder={placeholder}
      />
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        className="w-full bg-black/45 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-left focus:outline-none focus:border-white/20 flex items-center justify-between gap-1 truncate"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate text-white/90">{displayLabel(value)}</span>
        <svg
          className={`w-3 h-3 flex-shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
          style={{ background: "rgba(18,12,26,0.98)", maxHeight: "200px" }}
        >
          {/* Campo de busca interno */}
          <div className="p-1.5 border-b border-white/10 flex-shrink-0">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar golpe…"
              className="w-full bg-white/5 rounded-md px-2 py-1 text-[11px] text-white placeholder-white/30 focus:outline-none border border-white/10 focus:border-white/25"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setSearch("");
                }
              }}
            />
          </div>
          {/* Lista de opções */}
          <ul className="overflow-y-auto flex-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-[11px] text-white/40 italic">
                Nenhum golpe encontrado
              </li>
            )}
            {filtered.map((opt) => (
              <li
                key={opt}
                className={`px-3 py-1.5 cursor-pointer text-[11px] transition-colors ${
                  opt === value
                    ? "bg-white/10 text-white"
                    : "text-white/75 hover:bg-white/5 hover:text-white"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {displayLabel(opt)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Painel Principal ─────────────────────────────────────────────────────────

function ControlPanel() {
  const { state, updateState } = useStreamState();
  const { list: pokeList, loading: listLoading, error: listError } = usePokemonList();
  const [activeTab, setActiveTab] = useState<"jogo" | "demais">("jogo");

  const sponsorItemsText = state.sponsorItems.join(", ");
  const brbSponsorItemsText = state.brbSponsorItems.join(", ");

  const handlePlayerChange = (side: "left" | "right", key: string, value: string | number) => {
    updateState((prev) => ({
      ...prev,
      [side]: {
        ...prev[side],
        [key]: value,
      },
    }));
  };

  const handlePokemonChange = (
    side: "left" | "right",
    index: number,
    key: keyof PokemonCardData,
    value: any,
  ) => {
    updateState((prev) => {
      const teamKey = side === "left" ? "teamLeft" : "teamRight";
      const currentTeam = [...prev[teamKey]];
      const updatedPoke = { ...currentTeam[index] };
      if (key === "moves") {
        updatedPoke.moves = value;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updatedPoke as any)[key] = value;
      }
      currentTeam[index] = updatedPoke;
      return { ...prev, [teamKey]: currentTeam };
    });
  };

  const handleMoveChange = (
    side: "left" | "right",
    pokeIndex: number,
    moveIndex: number,
    value: string,
  ) => {
    updateState((prev) => {
      const teamKey = side === "left" ? "teamLeft" : "teamRight";
      const currentTeam = [...prev[teamKey]];
      const updatedPoke = { ...currentTeam[pokeIndex] };
      const currentMoves = [...(updatedPoke.moves || ["--", "--", "--", "--"])];
      currentMoves[moveIndex] = value;
      updatedPoke.moves = currentMoves;
      currentTeam[pokeIndex] = updatedPoke;
      return { ...prev, [teamKey]: currentTeam };
    });
  };

  return (
    <div className="min-h-screen bg-[color:var(--brand-ink)] text-white p-4 md:p-8 flex flex-col gap-6 selection:bg-[color:var(--brand-pink)] selection:text-white">
      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <BrandLogo variant="transparent" className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px]" />
          <div>
            <p className="font-heading text-[10px] tracking-[0.25em] text-[color:var(--brand-blue)]">
              STREAM MANAGEMENT
            </p>
            <h1 className="font-display text-2xl sm:text-3xl">Painel de Controle</h1>
          </div>
        </div>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-heading text-xs tracking-wider transition-colors"
        >
          ← Voltar ao Menu
        </Link>
      </header>

      <div className="flex gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("jogo")}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "jogo"
              ? "bg-white text-[color:var(--brand-ink)]"
              : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          Jogo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("demais")}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "demais"
              ? "bg-white text-[color:var(--brand-ink)]"
              : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          Demais
        </button>
      </div>

      {activeTab === "jogo" ? (
        <>
          {/* ── Seção Geral da Partida ── */}
          <section className="bg-[color:var(--surface-elevated)] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-1.5 h-4 rounded-full bg-[color:var(--brand-blue)]" />
              <h2 className="font-display text-lg tracking-wide uppercase">
                Informações da Partida
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/60 tracking-wider">ROUND</label>
                <input
                  type="text"
                  value={state.round}
                  onChange={(e) => updateState({ round: e.target.value })}
                  className="bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                  placeholder="Ex: Grand Finals, Top 8, Round 1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/60 tracking-wider">
                  FORMATO
                </label>
                <div className="flex bg-black/45 border border-white/10 rounded-xl p-1 h-full items-stretch">
                  <button
                    type="button"
                    onClick={() => updateState({ format: "BO1" })}
                    className={`flex-1 rounded-lg text-xs font-bold transition-all ${
                      state.format === "BO1"
                        ? "bg-[color:var(--brand-blue)] text-white shadow"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    BO1
                  </button>
                  <button
                    type="button"
                    onClick={() => updateState({ format: "BO3" })}
                    className={`flex-1 rounded-lg text-xs font-bold transition-all ${
                      state.format === "BO3"
                        ? "bg-[color:var(--brand-blue)] text-white shadow"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    BO3
                  </button>
                  <button
                    type="button"
                    onClick={() => updateState({ format: "BO5" })}
                    className={`flex-1 rounded-lg text-xs font-bold transition-all ${
                      state.format === "BO5"
                        ? "bg-[color:var(--brand-pink)] text-white shadow"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    BO5
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[color:var(--surface-elevated)] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-1.5 h-4 rounded-full bg-[color:var(--brand-blue)]" />
              <h2 className="font-display text-lg tracking-wide uppercase">
                Overlay — Na Transmissão & Patrocinadores
              </h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Título de painel
                </label>
                <input
                  type="text"
                  value={state.broadcastTitle}
                  onChange={(e) => updateState({ broadcastTitle: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Nomes / Line-up
                </label>
                <input
                  type="text"
                  value={state.broadcastNames}
                  onChange={(e) => updateState({ broadcastNames: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Descrição
                </label>
                <input
                  type="text"
                  value={state.broadcastDescription}
                  onChange={(e) => updateState({ broadcastDescription: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
                <label className="inline-flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={state.showBroadcastPanel}
                    onChange={(e) => updateState({ showBroadcastPanel: e.target.checked })}
                    className="h-4 w-4 rounded border-white/10 bg-black/45 accent-[color:var(--brand-blue)]"
                  />
                  Mostrar painel de transmissão
                </label>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Título de patrocinadores
                </label>
                <input
                  type="text"
                  value={state.sponsorTitle}
                  onChange={(e) => updateState({ sponsorTitle: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Itens de patrocinadores (vírgula separada)
                </label>
                <input
                  type="text"
                  value={sponsorItemsText}
                  onChange={(e) =>
                    updateState({
                      sponsorItems: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
                <label className="inline-flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={state.showSponsorPanel}
                    onChange={(e) => updateState({ showSponsorPanel: e.target.checked })}
                    className="h-4 w-4 rounded border-white/10 bg-black/45 accent-[color:var(--brand-blue)]"
                  />
                  Mostrar painel de patrocinadores
                </label>
              </div>
            </div>
          </section>

          {/* ── Colunas dos Jogadores ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── JOGADOR ESQUERDO (ROSA) ── */}
            <div className="flex flex-col gap-5">
              <section className="bg-[color:var(--surface-elevated)] border-l-4 border-l-[color:var(--brand-pink)] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 rounded-full bg-[color:var(--brand-pink)]" />
                    <h2 className="font-display text-lg tracking-wide uppercase">
                      Jogador Esquerdo (Rosa)
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handlePlayerChange("left", "score", Math.max(0, state.left.score - 1))
                      }
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg hover:bg-white/10 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-display text-2xl text-[color:var(--brand-pink)]">
                      {state.left.score}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlayerChange("left", "score", state.left.score + 1)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-white/50 tracking-wider">
                      NOME
                    </label>
                    <input
                      type="text"
                      value={state.left.name}
                      onChange={(e) =>
                        handlePlayerChange("left", "name", e.target.value.toUpperCase())
                      }
                      className="bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--brand-pink)]"
                      placeholder="Nome do Jogador"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-white/50 tracking-wider">
                      TAG
                    </label>
                    <input
                      type="text"
                      value={state.left.tag}
                      onChange={(e) =>
                        handlePlayerChange("left", "tag", e.target.value.toUpperCase())
                      }
                      className="bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--brand-pink)]"
                      placeholder="Tag / Equipe"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-white/50 tracking-wider">
                      PAÍS
                    </label>
                    <input
                      type="text"
                      value={state.left.country}
                      onChange={(e) =>
                        handlePlayerChange("left", "country", e.target.value.toUpperCase())
                      }
                      className="bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--brand-pink)]"
                      placeholder="Ex: USA, ITA, BRA"
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-xs tracking-widest text-white/40 uppercase">
                  Equipe (6 Slots)
                </h3>
                {state.teamLeft.map((poke, index) => (
                  <PokemonEditCard
                    key={index}
                    index={index}
                    poke={poke}
                    side="left"
                    pokeList={pokeList}
                    listLoading={listLoading}
                    listError={listError}
                    onFieldChange={(key, val) => handlePokemonChange("left", index, key, val)}
                    onMoveChange={(moveIdx, val) => handleMoveChange("left", index, moveIdx, val)}
                  />
                ))}
              </div>
            </div>

            {/* ── JOGADOR DIREITO (AZUL) ── */}
            <div className="flex flex-col gap-5">
              <section className="bg-[color:var(--surface-elevated)] border-l-4 border-l-[color:var(--brand-blue)] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 rounded-full bg-[color:var(--brand-blue)]" />
                    <h2 className="font-display text-lg tracking-wide uppercase">
                      Jogador Direito (Azul)
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handlePlayerChange("right", "score", Math.max(0, state.right.score - 1))
                      }
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg hover:bg-white/10 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-display text-2xl text-[color:var(--brand-blue)]">
                      {state.right.score}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlayerChange("right", "score", state.right.score + 1)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-white/50 tracking-wider">
                      NOME
                    </label>
                    <input
                      type="text"
                      value={state.right.name}
                      onChange={(e) =>
                        handlePlayerChange("right", "name", e.target.value.toUpperCase())
                      }
                      className="bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--brand-blue)]"
                      placeholder="Nome do Jogador"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-white/50 tracking-wider">
                      TAG
                    </label>
                    <input
                      type="text"
                      value={state.right.tag}
                      onChange={(e) =>
                        handlePlayerChange("right", "tag", e.target.value.toUpperCase())
                      }
                      className="bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--brand-blue)]"
                      placeholder="Tag / Equipe"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-white/50 tracking-wider">
                      PAÍS
                    </label>
                    <input
                      type="text"
                      value={state.right.country}
                      onChange={(e) =>
                        handlePlayerChange("right", "country", e.target.value.toUpperCase())
                      }
                      className="bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--brand-blue)]"
                      placeholder="Ex: USA, ITA, BRA"
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-xs tracking-widest text-white/40 uppercase">
                  Equipe (6 Slots)
                </h3>
                {state.teamRight.map((poke, index) => (
                  <PokemonEditCard
                    key={index}
                    index={index}
                    poke={poke}
                    side="right"
                    pokeList={pokeList}
                    listLoading={listLoading}
                    listError={listError}
                    onFieldChange={(key, val) => handlePokemonChange("right", index, key, val)}
                    onMoveChange={(moveIdx, val) => handleMoveChange("right", index, moveIdx, val)}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <section className="bg-[color:var(--surface-elevated)] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-1.5 h-4 rounded-full bg-[color:var(--brand-pink)]" />
              <h2 className="font-display text-lg tracking-wide uppercase">Starting Soon</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Texto superior
                </label>
                <input
                  type="text"
                  value={state.startingSoonPreline}
                  onChange={(e) => updateState({ startingSoonPreline: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-pink)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Descrição
                </label>
                <textarea
                  value={state.startingSoonDescription}
                  onChange={(e) => updateState({ startingSoonDescription: e.target.value })}
                  className="w-full min-h-[96px] resize-none bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-pink)] transition-colors"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Evento
                </label>
                <input
                  type="text"
                  value={state.startingSoonEvent}
                  onChange={(e) => updateState({ startingSoonEvent: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-pink)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Formato / Info
                </label>
                <input
                  type="text"
                  value={state.startingSoonFormat}
                  onChange={(e) => updateState({ startingSoonFormat: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-pink)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Casters
                </label>
                <input
                  type="text"
                  value={state.startingSoonCasters}
                  onChange={(e) => updateState({ startingSoonCasters: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-pink)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Stream
                </label>
                <input
                  type="text"
                  value={state.startingSoonStream}
                  onChange={(e) => updateState({ startingSoonStream: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-pink)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Status inferior
                </label>
                <input
                  type="text"
                  value={state.startingSoonStatus}
                  onChange={(e) => updateState({ startingSoonStatus: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-pink)] transition-colors"
                />
              </div>
            </div>
          </section>

          <section className="bg-[color:var(--surface-elevated)] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-1.5 h-4 rounded-full bg-[color:var(--brand-blue)]" />
              <h2 className="font-display text-lg tracking-wide uppercase">Be Right Back</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Manchete
                </label>
                <input
                  type="text"
                  value={state.brbHeadline}
                  onChange={(e) => updateState({ brbHeadline: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Título principal
                </label>
                <input
                  type="text"
                  value={state.brbTitle}
                  onChange={(e) => updateState({ brbTitle: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Descrição
                </label>
                <textarea
                  value={state.brbDescription}
                  onChange={(e) => updateState({ brbDescription: e.target.value })}
                  className="w-full min-h-[96px] resize-none bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Título da seção social
                </label>
                <input
                  type="text"
                  value={state.brbSocialTitle}
                  onChange={(e) => updateState({ brbSocialTitle: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Título da seção agenda
                </label>
                <input
                  type="text"
                  value={state.brbScheduleTitle}
                  onChange={(e) => updateState({ brbScheduleTitle: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Título de patrocínios
                </label>
                <input
                  type="text"
                  value={state.brbSponsorsTitle}
                  onChange={(e) => updateState({ brbSponsorsTitle: e.target.value })}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Patrocinadores (vírgula separada)
                </label>
                <input
                  type="text"
                  value={brbSponsorItemsText}
                  onChange={(e) =>
                    updateState({
                      brbSponsorItems: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--brand-blue)] transition-colors"
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// ─── PokemonEditCard ──────────────────────────────────────────────────────────

function PokemonEditCard({
  index,
  poke,
  side,
  pokeList,
  listLoading,
  listError,
  onFieldChange,
  onMoveChange,
}: {
  index: number;
  poke: PokemonCardData;
  side: "left" | "right";
  pokeList: PokeListEntry[];
  listLoading: boolean;
  listError: boolean;
  onFieldChange: (key: keyof PokemonCardData, value: any) => void;
  onMoveChange: (moveIdx: number, value: string) => void;
}) {
  const isLeft = side === "left";
  const activeColor = isLeft ? "rgba(221,13,168,0.25)" : "rgba(79,213,255,0.25)";
  const activeBorder = isLeft
    ? "border-[color:var(--brand-pink)]"
    : "border-[color:var(--brand-blue)]";
  const labelColor = isLeft ? "text-[color:var(--brand-pink)]" : "text-[color:var(--brand-blue)]";

  // Moves disponíveis para os dropdowns (carregados ao selecionar o Pokémon)
  const [moveOptions, setMoveOptions] = useState<string[]>([]);
  const [movesLoading, setMovesLoading] = useState(false);
  const [movesError, setMovesError] = useState(false);

  const moves = poke.moves || ["--", "--", "--", "--"];

  // Função de seleção de Pokémon (dispara busca de metadata, reset de fields e atualiza moves)
  const handlePokemonSelect = async (slug: string) => {
    onFieldChange("name", slug);
    onFieldChange("moves", ["--", "--", "--", "--"]);
    onFieldChange("item", "");
    onFieldChange("abilities", []);
    setMovesLoading(true);
    setMovesError(false);

    try {
      const metadata = await fetchPokemonMetadata(slug);
      setMoveOptions(["--", ...metadata.moves]);

      const selectedMoves = metadata.moves.slice(0, 4);
      onFieldChange("moves", [
        selectedMoves[0] ?? "--",
        selectedMoves[1] ?? "--",
        selectedMoves[2] ?? "--",
        selectedMoves[3] ?? "--",
      ]);

      onFieldChange("abilities", metadata.abilities);
      onFieldChange("item", metadata.item || "");
    } catch {
      setMovesError(true);
      setMoveOptions([]);
    } finally {
      setMovesLoading(false);
    }
  };

  return (
    <div
      className={`bg-[color:var(--surface-elevated)] border rounded-2xl p-4 shadow transition-all ${
        poke.active ? `${activeBorder} ring-1 ring-white/10` : "border-white/10"
      }`}
      style={poke.active ? { boxShadow: `0 0 12px ${activeColor}` } : undefined}
    >
      {/* Topo: Slot + Active checkbox */}
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-xs px-2 py-0.5 rounded bg-black/45 font-bold ${labelColor}`}
          >
            Slot {index + 1}
          </span>
          <span className="font-heading text-sm text-white/90 truncate max-w-[160px]">
            {poke.name
              ? poke.name
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join("-")
              : "Vazio"}
          </span>
        </div>

        {/* Checkbox Ativo — status removido (Tarefa 3) */}
        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold select-none">
          <input
            type="checkbox"
            checked={!!poke.active}
            onChange={(e) => onFieldChange("active", e.target.checked)}
            className="w-4 h-4 rounded bg-black/45 border-white/10 accent-[color:var(--brand-pink)] focus:ring-0 focus:outline-none"
          />
          <span className={poke.active ? labelColor : "text-white/60"}>ATIVO</span>
        </label>
      </div>

      {/* Grid: Nome (autocomplete) | Item | Habilidade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        {/* Autocomplete de Pokémon */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-semibold text-white/50 tracking-wider">
            NOME DO POKÉMON
          </label>
          <PokemonAutocomplete
            value={poke.name}
            list={pokeList}
            listLoading={listLoading}
            listError={listError}
            onSelect={handlePokemonSelect}
            inputClassName="w-full bg-black/45 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-white/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-semibold text-white/50 tracking-wider">
            ITEM CARREGADO
          </label>
          <input
            type="text"
            value={poke.item || ""}
            onChange={(e) => onFieldChange("item", e.target.value)}
            className="bg-black/45 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-white/20"
            placeholder="Ex: Choice Specs"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-semibold text-white/50 tracking-wider">
            HABILIDADE
          </label>
          <input
            type="text"
            value={(poke.abilities && poke.abilities[0]) || ""}
            onChange={(e) => onFieldChange("abilities", e.target.value ? [e.target.value] : [])}
            className="bg-black/45 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-white/20"
            placeholder="Ex: Good as Gold"
          />
        </div>
      </div>

      {/* Dropdowns dos 4 Golpes */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <label className="text-[9px] font-semibold text-white/50 tracking-wider">
            GOLPES (MOVES)
          </label>
          {movesLoading && (
            <span className="text-[9px] text-[color:var(--brand-blue)] animate-pulse">
              carregando…
            </span>
          )}
          {movesError && <span className="text-[9px] text-amber-400/70">dados indisponíveis</span>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, moveIdx) => (
            <MoveDropdown
              key={moveIdx}
              value={moves[moveIdx] || "--"}
              options={moveOptions}
              placeholder={`Golpe ${moveIdx + 1}`}
              onChange={(v) => onMoveChange(moveIdx, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
