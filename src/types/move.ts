import type {PokemonType} from "./pokemon.ts";

type Move = {
    nr: number;
    id: string;
    name: string;
    classifier: "physical" | "special" | "status",
    type: PokemonType
    gen: number;
    power: number;
    crit: number;
    maxHits: number;
    minHits: number;
}