import { useState, useEffect, useRef } from "react";
import type { PokemonCardData } from "@/components/overlay/PokemonCard";
import { MOCK_TEAM_LEFT, MOCK_TEAM_RIGHT } from "@/components/overlay/mockData";

export interface PlayerInfo {
  name: string;
  tag: string;
  country: string;
  score: number;
}

export interface StreamState {
  round: string;
  format: "BO1" | "BO3" | "BO5";
  timer: string;
  left: PlayerInfo;
  right: PlayerInfo;
  teamLeft: PokemonCardData[];
  teamRight: PokemonCardData[];
  showBroadcastPanel: boolean;
  broadcastTitle: string;
  broadcastNames: string;
  broadcastDescription: string;
  showSponsorPanel: boolean;
  sponsorTitle: string;
  sponsorItems: string[];
  startingSoonPreline: string;
  startingSoonDescription: string;
  startingSoonEvent: string;
  startingSoonFormat: string;
  startingSoonCasters: string;
  startingSoonStream: string;
  startingSoonStatus: string;
  brbHeadline: string;
  brbTitle: string;
  brbDescription: string;
  brbSocialTitle: string;
  brbScheduleTitle: string;
  brbSponsorsTitle: string;
  brbSponsorItems: string[];
}

const STORAGE_KEY = "x1-stream-state";
const CHANNEL_NAME = "x1-stream-suite-channel";

const DEFAULT_STATE: StreamState = {
  round: "Grand Finals",
  format: "BO5",
  timer: "08:43",
  left: {
    name: "WOLFE",
    tag: "LIQUID",
    country: "USA",
    score: 2,
  },
  right: {
    name: "BARUFFI",
    tag: "TSM",
    country: "ITA",
    score: 1,
  },
  teamLeft: MOCK_TEAM_LEFT,
  teamRight: MOCK_TEAM_RIGHT,
  showBroadcastPanel: true,
  broadcastTitle: "NA TRANSMISSÃO",
  broadcastNames: "Aaron Zheng · Gabby Snyder",
  broadcastDescription: "Inglês — twitch.tv/x1",
  showSponsorPanel: true,
  sponsorTitle: "PATROCINADORES",
  sponsorItems: ["Despausa", "Abring", "Brasília Gamehub"],
  startingSoonPreline: "X1? APRESENTA",
  startingSoonDescription:
    "Prepare-se — a transmissão começa em instantes. Aproveite para ajustar sua equipe.",
  startingSoonEvent: "Pokémon VGC Invitational",
  startingSoonFormat: "BO5 — Regulation H",
  startingSoonCasters: "Wolfey · Cybertron",
  startingSoonStream: "twitch.tv/x1",
  startingSoonStatus: "#X1WORLDS",
  brbHeadline: "INTERMISSÃO",
  brbTitle: "BE RIGHT BACK",
  brbDescription: "Pausa rápida — alongue, hidrate-se e volte com a equipe renovada.",
  brbSocialTitle: "ENQUANTO ESPERA",
  brbScheduleTitle: "PRÓXIMO",
  brbSponsorsTitle: "PATROCÍNIOS",
  brbSponsorItems: ["POKÉ MART", "SILPH", "DEVON", "ROTOM"],
};

function getInitialState(): StreamState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // Deep merge defaults to avoid issues if any new property is added
    return {
      ...DEFAULT_STATE,
      ...parsed,
      left: { ...DEFAULT_STATE.left, ...parsed.left },
      right: { ...DEFAULT_STATE.right, ...parsed.right },
      teamLeft: Array.isArray(parsed.teamLeft) ? parsed.teamLeft : DEFAULT_STATE.teamLeft,
      teamRight: Array.isArray(parsed.teamRight) ? parsed.teamRight : DEFAULT_STATE.teamRight,
      sponsorItems: Array.isArray(parsed.sponsorItems)
        ? parsed.sponsorItems
        : DEFAULT_STATE.sponsorItems,
      brbSponsorItems: Array.isArray(parsed.brbSponsorItems)
        ? parsed.brbSponsorItems
        : DEFAULT_STATE.brbSponsorItems,
    };
  } catch (err) {
    console.error("Failed to parse stream state from localStorage:", err);
    return DEFAULT_STATE;
  }
}

export function useStreamState() {
  const [state, setState] = useState<StreamState>(getInitialState);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Sync state across channels/storage
  useEffect(() => {
    // Initial Sync in case other tabs updated it before this one mounted
    setState(getInitialState());

    // Create BroadcastChannel
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data && event.data.type === "UPDATE_STATE") {
        setState(event.data.payload);
      }
    };

    // Fallback: listen to localStorage events (for other domains or fallback environments)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to parse updated localStorage stream state:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      channel.close();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const updateState = (updater: Partial<StreamState> | ((prev: StreamState) => StreamState)) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save stream state to localStorage:", err);
      }

      // Broadcast changes
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "UPDATE_STATE",
          payload: next,
        });
      }

      return next;
    });
  };

  return { state, updateState };
}
