#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_API_URL = "https://pokeapi.co/api/v2/move";
const DEFAULT_DELAY_MS = 5_000;
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_RETRIES = 3;

function parseArguments(argv) {
	const options = {
		apiUrl: DEFAULT_API_URL,
		delayMs: DEFAULT_DELAY_MS,
		pageSize: DEFAULT_PAGE_SIZE,
		retries: DEFAULT_RETRIES,
		outputFile: path.resolve(process.cwd(), "moves.json"),
		checkpointFile: path.resolve(process.cwd(), "moves.checkpoint.json"),
	};

	for (const argument of argv) {
		if (argument === "--help" || argument === "-h") {
			options.help = true;
			continue;
		}

		const [key, ...valueParts] = argument.split("=");
		const value = valueParts.join("=");

		switch (key) {
			case "--api-url":
				options.apiUrl = requireValue(key, value);
				break;
			case "--delay":
				options.delayMs = parseNonNegativeInteger(key, value);
				break;
			case "--page-size":
				options.pageSize = parsePositiveInteger(key, value);
				break;
			case "--retries":
				options.retries = parseNonNegativeInteger(key, value);
				break;
			case "--output":
				options.outputFile = path.resolve(
					process.cwd(),
					requireValue(key, value),
				);
				break;
			case "--checkpoint":
				options.checkpointFile = path.resolve(
					process.cwd(),
					requireValue(key, value),
				);
				break;
			default:
				throw new Error(`Unknown argument: ${argument}`);
		}
	}

	return options;
}

function requireValue(key, value) {
	if (!value) {
		throw new Error(`${key} requires a value, for example ${key}=5000`);
	}

	return value;
}

function parsePositiveInteger(key, value) {
	const parsed = Number.parseInt(requireValue(key, value), 10);

	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new Error(`${key} must be a positive integer`);
	}

	return parsed;
}

function parseNonNegativeInteger(key, value) {
	const parsed = Number.parseInt(requireValue(key, value), 10);

	if (!Number.isInteger(parsed) || parsed < 0) {
		throw new Error(`${key} must be zero or a positive integer`);
	}

	return parsed;
}

function printHelp() {
	console.log(`Fetch Pokémon moves from PokéAPI and store them as JSON.

Usage:
  node fetch-pokemon-moves.js [options]

Options:
  --delay=<milliseconds>       Delay between move requests (default: 5000)
  --page-size=<number>         Moves requested per list page (default: 100)
  --retries=<number>           Retries for 429 and 5xx responses (default: 3)
  --output=<path>              Output JSON file (default: ./moves.json)
  --checkpoint=<path>          Checkpoint file (default: ./moves.checkpoint.json)
  --api-url=<url>              Move list endpoint
  --help                       Show this help

Examples:
  node fetch-pokemon-moves.js
  node fetch-pokemon-moves.js --delay=1000 --page-size=200
  node fetch-pokemon-moves.js --output=src/data/moves.json
`);
}

function sleep(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchJson(url, { retries }) {
	let attempt = 0;

	while (true) {
		try {
			const response = await fetch(url, {
				headers: {
					accept: "application/json",
					"user-agent": "poketype-move-dataset-builder/1.0",
				},
			});

			if (response.ok) {
				return await response.json();
			}

			const retryable = response.status === 429 || response.status >= 500;
			if (!retryable || attempt >= retries) {
				throw new Error(`Request failed with HTTP ${response.status}: ${url}`);
			}

			const retryAfterSeconds = Number.parseInt(
				response.headers.get("retry-after") ?? "",
				10,
			);
			const retryDelayMs = Number.isInteger(retryAfterSeconds)
				? retryAfterSeconds * 1_000
				: Math.min(30_000, 1_000 * 2 ** attempt);

			console.warn(
				`Request returned HTTP ${response.status}. Retrying in ${retryDelayMs} ms (${attempt + 1}/${retries}).`,
			);
			await sleep(retryDelayMs);
			attempt += 1;
		} catch (error) {
			if (attempt >= retries) {
				throw error;
			}

			const retryDelayMs = Math.min(30_000, 1_000 * 2 ** attempt);
			console.warn(
				`Request failed: ${error.message}. Retrying in ${retryDelayMs} ms (${attempt + 1}/${retries}).`,
			);
			await sleep(retryDelayMs);
			attempt += 1;
		}
	}
}

function romanToInteger(romanNumeral) {
	const values = {
		I: 1,
		V: 5,
		X: 10,
		L: 50,
		C: 100,
		D: 500,
		M: 1_000,
	};

	const normalized = romanNumeral.toUpperCase();
	let total = 0;

	for (let index = 0; index < normalized.length; index += 1) {
		const current = values[normalized[index]];
		const next = values[normalized[index + 1]] ?? 0;

		if (!current) {
			throw new Error(`Invalid Roman numeral: ${romanNumeral}`);
		}

		total += current < next ? -current : current;
	}

	if (total <= 0) {
		throw new Error(`Invalid Roman numeral: ${romanNumeral}`);
	}

	return total;
}

function toGenerationNumber(generationName) {
	const prefix = "generation-";

	if (!generationName.startsWith(prefix)) {
		throw new Error(`Unexpected generation name: ${generationName}`);
	}

	return romanToInteger(generationName.slice(prefix.length));
}

function toMove(move) {
	const classifier = move.damage_class?.name;

	if (!["physical", "special", "status"].includes(classifier)) {
		throw new Error(
			`Move ${move.name} has an unsupported damage class: ${classifier}`,
		);
	}

	const englishName = move.names?.find(
		(candidate) => candidate.language?.name === "en",
	)?.name;

	return {
		nr: move.id,
		id: move.name,
		name: englishName ?? move.name,
		classifier,
		type: move.type?.name,
		gen: toGenerationNumber(move.generation?.name),
		accuracy: move.accuracy,
		power: move.power ?? 0,
		crit: move.meta?.crit_rate ?? 0,
		maxHits: move.meta?.max_hits ?? 1,
		minHits: move.meta?.min_hits ?? 1,
	};
}

function createInitialCheckpoint(options) {
	const firstPageUrl = new URL(options.apiUrl);
	firstPageUrl.searchParams.set("offset", "0");
	firstPageUrl.searchParams.set("limit", String(options.pageSize));

	return {
		version: 1,
		complete: false,
		pageSize: options.pageSize,
		currentPage: 1,
		lastCompletedPage: 0,
		nextMoveIndex: 0,
		pageUrl: firstPageUrl.toString(),
		fetchedMoves: 0,
		updatedAt: new Date().toISOString(),
	};
}

async function readJsonFile(filePath, fallback) {
	try {
		const content = await fs.readFile(filePath, "utf8");
		return JSON.parse(content);
	} catch (error) {
		if (error.code === "ENOENT") {
			return fallback;
		}

		throw new Error(`Could not read ${filePath}: ${error.message}`, {
			cause: error,
		});
	}
}

async function writeJsonAtomic(filePath, value) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });

	const temporaryFile = `${filePath}.${process.pid}.tmp`;
	const json = `${JSON.stringify(value, null, 2)}\n`;

	await fs.writeFile(temporaryFile, json, "utf8");
	await fs.rename(temporaryFile, filePath);
}

function validateCheckpoint(checkpoint, options) {
	if (checkpoint.version !== 1) {
		throw new Error(`Unsupported checkpoint version: ${checkpoint.version}`);
	}

	if (checkpoint.pageSize !== options.pageSize) {
		throw new Error(
			`The checkpoint uses page size ${checkpoint.pageSize}, but this run uses ${options.pageSize}. ` +
				"Use the same --page-size value or remove the checkpoint file to restart.",
		);
	}
}

function indexMoves(moves) {
	const movesByNumber = new Map();

	for (const move of moves) {
		if (!Number.isInteger(move.nr)) {
			throw new Error(
				`Output file contains a move with an invalid nr: ${JSON.stringify(move)}`,
			);
		}

		movesByNumber.set(move.nr, move);
	}

	return movesByNumber;
}

async function persistProgress({ movesByNumber, checkpoint, options }) {
	const sortedMoves = [...movesByNumber.values()].sort(
		(left, right) => left.nr - right.nr,
	);
	checkpoint.fetchedMoves = sortedMoves.length;
	checkpoint.updatedAt = new Date().toISOString();

	await writeJsonAtomic(options.outputFile, sortedMoves);
	await writeJsonAtomic(options.checkpointFile, checkpoint);
}

async function run(options) {
	const existingMoves = await readJsonFile(options.outputFile, []);
	const movesByNumber = indexMoves(existingMoves);
	const checkpoint = await readJsonFile(
		options.checkpointFile,
		createInitialCheckpoint(options),
	);

	validateCheckpoint(checkpoint, options);

	if (checkpoint.complete) {
		console.log(
			`Move retrieval is already complete. ${movesByNumber.size} moves are stored in ${options.outputFile}.`,
		);
		return;
	}

	console.log(`Writing moves to: ${options.outputFile}`);
	console.log(`Writing checkpoint to: ${options.checkpointFile}`);
	console.log(`Delay between move requests: ${options.delayMs} ms`);

	while (checkpoint.pageUrl) {
		console.log(
			`\nFetching page ${checkpoint.currentPage}: ${checkpoint.pageUrl}`,
		);
		const page = await fetchJson(checkpoint.pageUrl, options);

		if (!Array.isArray(page.results)) {
			throw new Error(
				`Page ${checkpoint.currentPage} did not contain a results array`,
			);
		}

		if (checkpoint.nextMoveIndex > page.results.length) {
			throw new Error(
				`Checkpoint move index ${checkpoint.nextMoveIndex} exceeds page size ${page.results.length}`,
			);
		}

		for (
			let index = checkpoint.nextMoveIndex;
			index < page.results.length;
			index += 1
		) {
			const moveReference = page.results[index];
			const progress = `${index + 1}/${page.results.length}`;

			console.log(
				`[page ${checkpoint.currentPage}, move ${progress}] Fetching ${moveReference.name}`,
			);
			const moveResponse = await fetchJson(moveReference.url, options);
			checkpoint.nextMoveIndex = index + 1;

			const category = moveResponse.meta?.category?.name ?? "unknown-or-null";
			if (!category.includes("damage")) {
				console.log(
					`[page ${checkpoint.currentPage}, move ${progress}] Skipping ${moveReference.name}: not a damage move (${category})`,
				);
				await persistProgress({ movesByNumber, checkpoint, options });
			} else {
				const move = toMove(moveResponse);
				movesByNumber.set(move.nr, move);
				await persistProgress({ movesByNumber, checkpoint, options });
				console.log(
					`[page ${checkpoint.currentPage}, move ${progress}] Added ${moveReference.name} (cat: ${category})`,
				);
			}
			const hasAnotherMoveOnPage = index + 1 < page.results.length;
			const hasAnotherPage = Boolean(page.next);
			if (options.delayMs > 0 && (hasAnotherMoveOnPage || hasAnotherPage)) {
				await sleep(options.delayMs);
			}
		}

		checkpoint.lastCompletedPage = checkpoint.currentPage;
		checkpoint.currentPage += 1;
		checkpoint.nextMoveIndex = 0;
		checkpoint.pageUrl = page.next;
		checkpoint.complete = page.next === null;

		await persistProgress({ movesByNumber, checkpoint, options });
		console.log(`Completed page ${checkpoint.lastCompletedPage}.`);
	}

	console.log(
		`\nDone. Stored ${movesByNumber.size} moves in ${options.outputFile}.`,
	);
}

async function main() {
	try {
		const options = parseArguments(process.argv.slice(2));

		if (options.help) {
			printHelp();
			return;
		}

		if (typeof fetch !== "function") {
			throw new Error(
				"This script requires Node.js 18 or newer because it uses the built-in fetch API.",
			);
		}

		await run(options);
	} catch (error) {
		console.error(`\nMove retrieval failed: ${error.message}`);
		process.exitCode = 1;
	}
}

main();
