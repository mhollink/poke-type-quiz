import { readFile, writeFile } from "node:fs/promises";

const delayInMs = 7000;

(() => {
	let pokemonData = [];

	function delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function capitalizeFirstLetter(val) {
		return String(val).charAt(0).toUpperCase() + String(val).slice(1);
	}

	function toTypeName(name) {
		return name.toLowerCase().replaceAll("-", " ");
	}

	function convertToDataPoint(pokemonData) {
		return {
			nr: pokemonData.id,
			id: pokemonData.name,
			name: capitalizeFirstLetter(pokemonData.name),
			types: pokemonData.types.map((slot) => toTypeName(slot.type.name)),
		};
	}

	async function loadAllPokemon(from = 1, to = 493) {
		console.log(`Fetching the first ${from} pokemon from pokeapi...\n`);
		for (let dexNumber = from; dexNumber <= to; dexNumber++) {
			try {
				console.log(`Processing pokemon (${dexNumber} / ${to})`);
				const pokemon = await getPokemon(dexNumber);

				pokemonData = [...pokemonData, pokemon]
					.sort((a, b) => a.nr - b.nr)
					.filter((pokemon, index, self) => {
						return (
							index ===
							self.findIndex((candidate) => candidate.nr === pokemon.nr)
						);
					});

				console.log(`Writing data...`);
				await writeFile(
					`src/assets/pokemon.json`,
					JSON.stringify(pokemonData),
					"utf-8",
				);
				console.log(`Completed saving data for pokemon ${dexNumber}...`);
			} catch (e) {
				console.error(`Failed to fetch pokemon ${dexNumber}\n`);
				console.error(e);
				console.log("\n");
				await delay(delayInMs);
			}
		}
		console.log(`\nDone fetching pokemon!!`);
	}

	async function getPokemon(dexNumber) {
		const pokemon = pokemonData.find((pokemon) => pokemon.nr === dexNumber);
		if (pokemon) {
			console.log("Pokemon already known in dataset, skipping...");
			await delay(500);
			return pokemon;
		}

		console.log("Retrieving pokemon information...");
		await delay(delayInMs);
		return fetch(`https://pokeapi.co/api/v2/pokemon/${dexNumber}`)
			.then((res) => res.json())
			.then((data) => convertToDataPoint(data));
	}

	async function loadAlreadyKnownPokemon() {
		try {
			const content = await readFile("src/assets/pokemon.json", "utf-8");
			pokemonData = JSON.parse(content);
		} catch (e) {
			console.error("Could not preload existing pokemon from storage.", e);
			process.exit(1);
		}
	}

	async function main() {
		await loadAlreadyKnownPokemon();
		await loadAllPokemon(1, 1025);
	}

	main();
})();
