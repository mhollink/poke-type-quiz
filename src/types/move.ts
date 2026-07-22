import type { PokemonType } from "./pokemon.ts";

export const CLASSIFIERS = ["physical", "special", "status"] as const;

export type MoveClassifier = (typeof CLASSIFIERS)[number];

export type Move = {
	nr: number; // number id of the move on PokeAPI
	id: string; // slugified name id for the move
	name: string; // human readable and capitalized move name
	classifier: MoveClassifier; // Damage type of move, probably irrelevant for now
	type: PokemonType; // move type for super effective calculation
	gen: number; // generation this move was introduced into the franchise
	accuracy: number; // the change this move hits with a value between 0 and 100.
	power: number; // raw base power for the move
	crit: number; // crit change: 0=0% 1=12.5%, 2=50%, >3=100%
	minHits: number; // minimum times the move will hit.
	maxHits: number; // maximum times the move can hit
};
