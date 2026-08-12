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
    return identifier.split("-").map(capitalizeFirstLetter).join(" ");
  }

  function createAlternateFormEntry(apiPokemon, formInfo, original) {
    const types = [...apiPokemon.types]
      .sort((left, right) => left.slot - right.slot)
      .map(({ type }) => type.name);

    const name =
      formInfo?.names?.find((name) => name.language.name === "en")?.name ??
      toDisplayName(apiPokemon.name);

    return {
      nr: apiPokemon.id,
      id: apiPokemon.name,
      name,
      types,
      gen: original?.gen ?? null,
      origin: original?.nr ?? null,
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
  async function fetchFormInfo(form) {
    if (!(form.forms && form.forms.length > 0)) {
      console.error("Form does not have url");
      return null;
    }

    const url = form.forms[0].url;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${form}: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  async function addAlternateForms() {
    const existingIds = new Set(pokemonData.map(({ id }) => id));

    for (const form of alternateForms) {
      if (existingIds.has(form.name)) {
        // console.debug(`Skipping already known form: ${form.name}`);
        continue;
      }

      const apiPokemon = await fetchAlternateForm(form);
      const formInfo = await fetchFormInfo(apiPokemon);
      const original = pokemonData.find(
        ({ id }) => id === apiPokemon.species.name,
      );

      const newEntry = createAlternateFormEntry(apiPokemon, formInfo, original);

      pokemonData.push(newEntry);
      existingIds.add(newEntry.id);

      await writeFile(
        `src/assets/pokemon.json`,
        JSON.stringify(pokemonData),
        "utf-8",
      );
      console.log(`Added ${newEntry.name} with origin ${newEntry.origin}`);
      await delay(delayInMs);
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
