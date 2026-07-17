import type { PokemonType } from "../types/pokemon";

type TypeColor = {
	background: string;
	foreground: string;
};

export const TYPE_COLORS: Record<PokemonType, TypeColor> = {
	normal: {
		background: "#A8A77A",
		foreground: "#1f1f1f",
	},
	fire: {
		background: "#EE8130",
		foreground: "#1f1f1f",
	},
	water: {
		background: "#6390F0",
		foreground: "#ffffff",
	},
	electric: {
		background: "#F7D02C",
		foreground: "#1f1f1f",
	},
	grass: {
		background: "#7AC74C",
		foreground: "#1f1f1f",
	},
	ice: {
		background: "#96D9D6",
		foreground: "#1f1f1f",
	},
	fighting: {
		background: "#C22E28",
		foreground: "#ffffff",
	},
	poison: {
		background: "#A33EA1",
		foreground: "#ffffff",
	},
	ground: {
		background: "#E2BF65",
		foreground: "#1f1f1f",
	},
	flying: {
		background: "#A98FF3",
		foreground: "#1f1f1f",
	},
	psychic: {
		background: "#F95587",
		foreground: "#1f1f1f",
	},
	bug: {
		background: "#A6B91A",
		foreground: "#1f1f1f",
	},
	rock: {
		background: "#B6A136",
		foreground: "#1f1f1f",
	},
	ghost: {
		background: "#735797",
		foreground: "#ffffff",
	},
	dragon: {
		background: "#6F35FC",
		foreground: "#ffffff",
	},
	dark: {
		background: "#705746",
		foreground: "#ffffff",
	},
	steel: {
		background: "#B7B7CE",
		foreground: "#1f1f1f",
	},
	fairy: {
		background: "#D685AD",
		foreground: "#1f1f1f",
	},
};
