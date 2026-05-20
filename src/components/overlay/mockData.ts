import type { PokemonCardData } from "./PokemonCard";

/**
 * Dados de mock para desenvolvimento local.
 *
 * Formato VGC overlay — sem HP, com item, moves e abilities.
 * Em produção estes dados são substituídos pelo hook usePokemonTeam
 * que busca sprites da PokéAPI e stats do Smogon.
 */

export const MOCK_TEAM_LEFT: PokemonCardData[] = [
  {
    name: "Miraidon",
    types: ["Electric", "Dragon"],
    item: "Choice Specs",
    moves: ["Electro Drift", "Draco Meteor", "Volt Switch", "Overheat"],
    abilities: ["Hadron Engine"],
    active: true,
  },
  {
    name: "Flutter Mane",
    types: ["Ghost", "Fairy"],
    item: "Booster Energy",
    moves: ["Moonblast", "Shadow Ball", "Perish Song", "Protect"],
    abilities: ["Protosynthesis"],
    active: true,
  },
  {
    name: "Urshifu",
    types: ["Fighting", "Dark"],
    item: "Focus Sash",
    moves: ["Wicked Blow", "Close Combat", "Protect", "Sucker Punch"],
    abilities: ["Unseen Fist"],
    status: "par",
  },
  {
    name: "Rillaboom",
    types: ["Grass"],
    item: "Assault Vest",
    moves: ["Grassy Glide", "Wood Hammer", "U-turn", "Fake Out"],
    abilities: ["Grassy Surge"],
    fainted: true,
  },
  {
    name: "Tornadus",
    types: ["Flying"],
    item: "Covert Cloak",
    moves: ["Bleakwind Storm", "Taunt", "Rain Dance", "Protect"],
    abilities: ["Prankster"],
  },
  {
    name: "Amoonguss",
    types: ["Grass", "Poison"],
    item: "Sitrus Berry",
    moves: ["Spore", "Pollen Puff", "Rage Powder", "Protect"],
    abilities: ["Regenerator"],
  },
];

export const MOCK_TEAM_RIGHT: PokemonCardData[] = [
  {
    name: "Calyrex-Shadow",
    types: ["Psychic", "Ghost"],
    item: "Life Orb",
    moves: ["Astral Barrage", "Psyshock", "Nasty Plot", "Protect"],
    abilities: ["As One"],
    active: true,
  },
  {
    name: "Incineroar",
    types: ["Fire", "Dark"],
    item: "Safety Goggles",
    moves: ["Fake Out", "Flare Blitz", "Knock Off", "Parting Shot"],
    abilities: ["Intimidate"],
    active: true,
  },
  {
    name: "Whimsicott",
    types: ["Grass", "Fairy"],
    item: "Focus Sash",
    moves: ["Moonblast", "Tailwind", "Encore", "Protect"],
    abilities: ["Prankster"],
  },
  {
    name: "Heatran",
    types: ["Fire", "Steel"],
    item: "Leftovers",
    moves: ["Heat Wave", "Earth Power", "Flash Cannon", "Protect"],
    abilities: ["Flash Fire"],
    status: "brn",
  },
  {
    name: "Ursaluna",
    types: ["Ground", "Normal"],
    item: "Flame Orb",
    moves: ["Headlong Rush", "Facade", "Protect", "High Horsepower"],
    abilities: ["Guts"],
    fainted: true,
  },
  {
    name: "Iron Hands",
    types: ["Fighting", "Electric"],
    item: "Assault Vest",
    moves: ["Drain Punch", "Wild Charge", "Fake Out", "Heavy Slam"],
    abilities: ["Quark Drive"],
  },
];
