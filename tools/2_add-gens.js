// add-generations.mjs
import { readFile, writeFile } from "node:fs/promises";

const GENERATIONS = [
	{ generation: 1, first: 1, last: 151 },
	{ generation: 2, first: 152, last: 251 },
	{ generation: 3, first: 252, last: 386 },
	{ generation: 4, first: 387, last: 493 },
	{ generation: 5, first: 494, last: 649 },
	{ generation: 6, first: 650, last: 721 },
	{ generation: 7, first: 722, last: 809 },
	{ generation: 8, first: 810, last: 905 },
	{ generation: 9, first: 906, last: 1025 },
];

function getGeneration(dexNumber) {
	const generation = GENERATIONS.find(
		({ first, last }) => dexNumber >= first && dexNumber <= last,
	);

	return generation?.generation ?? -1;
}

async function main() {
	const inputPath = process.argv[2] ?? "./pokemon.json";
	const outputPath = process.argv[3] ?? "./pokemon-with-generations.json";

	const fileContents = await readFile(inputPath, "utf8");
	const pokemon = JSON.parse(fileContents);

	if (!Array.isArray(pokemon)) {
		throw new TypeError("Expected the input JSON to contain an array");
	}

	const pokemonWithGenerations = pokemon
		.map((entry) => {
			if (!Number.isInteger(entry.nr)) {
				throw new TypeError(
					`Invalid Pokédex number for ${entry.name ?? "unknown Pokémon"}: ${entry.nr}`,
				);
			}

			return {
				...entry,
				gen: getGeneration(entry.nr),
			};
		})
		.sort((a, b) => a.nr - b.nr);

	await writeFile(
		outputPath,
		`${JSON.stringify(pokemonWithGenerations, null, 2)}\n`,
		"utf8",
	);

	console.log(`Added generations to ${pokemonWithGenerations.length} Pokémon`);
	console.log(`Written to ${outputPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
