import { readFile, writeFile } from "node:fs/promises";

const delayInMs = 5000;

(() => {
	let pokemonData = [];
	let alternateForms = [];

	function delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function capitalizeFirstLetter(val) {
		return String(val).charAt(0).toUpperCase() + String(val).slice(1);
	}

	function toDisplayName(identifier) {
		return identifier
			.split("-")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ");
	}

	function toTypeName(name) {
		return name.toLowerCase().replaceAll("-", " ");
	}

	function haveExactSameTypes(left, right) {
		return left[0] === right[0] && left[1] === right[1];
	}

	function createAlternateFormEntry(apiPokemon, original) {
		const types = [...apiPokemon.types]
			.sort((left, right) => left.slot - right.slot)
			.map(({ type }) => type.name);

		return {
			nr: apiPokemon.id,
			id: apiPokemon.name,
			name: toDisplayName(apiPokemon.name),
			types,
			gen: original.gen,
			origin: original.nr,
		};
	}

	async function fetchAlternateForm(form) {
		const response = await fetch(form.url);

		if (!response.ok) {
			throw new Error(
				`Failed to fetch ${form.name}: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}

	async function addAlternateForms() {
		const existingIds = new Set(pokemonData.map(({ id }) => id));

		for (const form of alternateForms) {
			if (existingIds.has(form.name)) {
				console.log(`Skipping already known form: ${form.name}`);
				continue;
			}

			const apiPokemon = await fetchAlternateForm(form);

			const original = pokemonData.find(
				({ id }) => id === apiPokemon.species.name,
			);

			if (!original) {
				console.warn(
					`Could not find original Pokémon "${apiPokemon.species.name}" for form "${apiPokemon.name}"`,
				);
				continue;
			}

			const alternateTypes = apiPokemon.types
				.sort((left, right) => left.slot - right.slot)
				.map(({ type }) => type.name);

			if (haveExactSameTypes(original.types, alternateTypes)) {
				console.log(
					`Skipping ${apiPokemon.name}: typing matches ${original.id}`,
				);
				continue;
			}

			const newEntry = createAlternateFormEntry(apiPokemon, original);

			pokemonData.push(newEntry);
			existingIds.add(newEntry.id);

			await writeFile(
				`src/assets/pokemon.json`,
				JSON.stringify(pokemonData),
				"utf-8",
			);
			console.log(`Added ${newEntry.name} with origin ${newEntry.origin}`);
		}
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

	async function loadAlternateForms() {
		try {
			const content = await readFile("./tools/alternate-forms.json", "utf-8");
			alternateForms = JSON.parse(content).results;
		} catch (e) {
			console.error("Could not preload existing pokemon from storage.", e);
			process.exit(1);
		}
	}

	async function main() {
		await loadAlreadyKnownPokemon();
		await loadAlternateForms();

		await addAlternateForms();
	}

	main();
})();
