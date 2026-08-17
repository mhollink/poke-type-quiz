import sharp from "sharp";

import fs from "node:fs/promises";
import path from "node:path";

const SPRITE_SIZE = 96;
const COLUMNS = 32;

const REGULAR_POKEMON_COUNT = 1025;
const FIRST_ALTERNATE_FORM = 10001;
const LAST_ALTERNATE_FORM = 10323;

const SPRITE_DIRECTORY = "./sprites/regular";
const SHINY_DIRECTORY = "./sprites/shiny";

const OUTPUT_DIRECTORY = "./public/sprites";

function getSpriteIndex(nr) {
  if (nr >= FIRST_ALTERNATE_FORM) {
    return REGULAR_POKEMON_COUNT + (nr - FIRST_ALTERNATE_FORM);
  }

  return nr - 1;
}

function getAllSpriteIds() {
  return [
    ...Array.from({ length: REGULAR_POKEMON_COUNT }, (_, index) => index + 1),
    ...Array.from(
      { length: LAST_ALTERNATE_FORM - FIRST_ALTERNATE_FORM + 1 },
      (_, index) => FIRST_ALTERNATE_FORM + index,
    ),
  ];
}

async function fileExists(filename) {
  try {
    await fs.access(filename);
    return true;
  } catch {
    return false;
  }
}

async function generateSpritesheet(inputDirectory, outputFile) {
  const spriteIds = getAllSpriteIds();

  const spriteCount =
    Math.max(...spriteIds.map((spriteId) => getSpriteIndex(spriteId))) + 1;

  const rows = Math.ceil(spriteCount / COLUMNS);

  const width = COLUMNS * SPRITE_SIZE;
  const height = rows * SPRITE_SIZE;

  const composites = [];

  for (const spriteId of spriteIds) {
    const filename = path.join(inputDirectory, `${spriteId}.png`);

    if (!(await fileExists(filename))) {
      console.warn(`Missing sprite: ${filename}`);
      continue;
    }

    const index = getSpriteIndex(spriteId);

    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);

    const sprite = await sharp(filename)
      .resize(SPRITE_SIZE, SPRITE_SIZE, {
        fit: "contain",
      })
      .toBuffer();

    composites.push({
      input: sprite,
      left: column * SPRITE_SIZE,
      top: row * SPRITE_SIZE,
    });
  }

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },
    },
  })
    .composite(composites)
    .webp({
      lossless: true,
    })
    .toFile(outputFile);

  console.log(
    `Generated ${outputFile} (${width}x${height}, ${spriteCount} slots)`,
  );
}

await fs.mkdir(OUTPUT_DIRECTORY, { recursive: true });

await Promise.all([
  generateSpritesheet(
    SPRITE_DIRECTORY,
    path.join(OUTPUT_DIRECTORY, "pokemon.webp"),
  ),
  generateSpritesheet(
    SHINY_DIRECTORY,
    path.join(OUTPUT_DIRECTORY, "pokemon-shiny.webp"),
  ),
]);
