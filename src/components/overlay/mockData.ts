import type { PokemonCardData } from "./PokemonCard";

export const MOCK_TEAM_LEFT: PokemonCardData[] = [
  { name: "Miraidon", hpCurrent: 175, hpMax: 175, types: ["Electric", "Dragon"], item: "Choice Specs", active: true },
  { name: "Flutter Mane", hpCurrent: 110, hpMax: 131, types: ["Ghost", "Fairy"], item: "Booster Energy", active: true },
  { name: "Urshifu", hpCurrent: 60, hpMax: 175, types: ["Fighting", "Dark"], item: "Focus Sash", status: "par" },
  { name: "Rillaboom", hpCurrent: 0, hpMax: 191, types: ["Grass"], item: "Assault Vest", status: "fnt", fainted: true },
  { name: "Tornadus", hpCurrent: 140, hpMax: 160, types: ["Flying"], item: "Covert Cloak" },
  { name: "Amoonguss", hpCurrent: 200, hpMax: 220, types: ["Grass", "Poison"], item: "Sitrus Berry", status: "psn" },
];

export const MOCK_TEAM_RIGHT: PokemonCardData[] = [
  { name: "Calyrex-S", hpCurrent: 165, hpMax: 175, types: ["Psychic", "Ghost"], item: "Life Orb", active: true },
  { name: "Incineroar", hpCurrent: 160, hpMax: 192, types: ["Fire", "Dark"], item: "Safety Goggles", active: true },
  { name: "Whimsicott", hpCurrent: 130, hpMax: 130, types: ["Grass", "Fairy"], item: "Focus Sash" },
  { name: "Heatran", hpCurrent: 50, hpMax: 187, types: ["Fire", "Steel"], item: "Leftovers", status: "brn" },
  { name: "Ursaluna", hpCurrent: 0, hpMax: 240, types: ["Ground", "Normal"], status: "fnt", fainted: true },
  { name: "Iron Hands", hpCurrent: 220, hpMax: 230, types: ["Fighting", "Electric"], item: "Assault Vest" },
];
