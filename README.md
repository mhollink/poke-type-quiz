# Poketype

Poketype is a collection of fast-paced Pokémon knowledge games focused on typings, matchups, and type effectiveness.

Test how well you know Pokémon across multiple game modes, from identifying type combinations and surviving timed rounds to choosing the strongest move in battle. Select the generations you want to play with, build out your Pokédex, and keep coming back for daily challenges.

[Play Poketype](https://mhollink.github.io/poke-type-quiz/)

## Game Modes

### Type Rush

A daily five-minute challenge built around exact Pokémon typings.

You are shown a single type or type combination and must name a Pokémon whose complete typing matches the challenge.

- One attempt per day
- Five-minute starting timer
- Correct answers add time
- Incorrect answers cost time and reset your streak
- Rounds can be skipped at an additional time cost
- Pokémon cannot be reused during the same run
- Harder challenges and longer streaks award more points
- Eligible answers are added to your Pokédex after the run

### Type Survival

A fast survival mode where one mistake ends the run.

You are shown a Pokémon type and must name any Pokémon that has that type. Unlike Type Rush, the Pokémon may have an additional secondary type.

- 30 seconds per round
- One incorrect answer ends the run
- Running out of time ends the run
- Pokémon cannot be reused during the same run
- Faster answers and more difficult rounds award more points
- Correctly guessed Pokémon are added to your Pokédex

### Type Recall

The typing quiz in reverse.

A Pokémon is shown and you must identify its complete typing before the timer expires.

- 30 seconds per round
- Identify both types for dual-type Pokémon
- Correct type order awards bonus points
- One incorrect answer ends the run
- Correctly completed Pokémon are added to your Pokédex

### Battle Tactics

A daily battle challenge focused on type effectiveness.

For each Pokémon, choose the strongest move from four available options. Your score depends on how effective your choice is compared with the best possible move.

- 30 battles per daily challenge
- Four move options per round
- Better type matchups award more points
- No run-ending penalty for choosing a weaker move
- Results include your score, maximum possible score, and percentage

## Features

- Four distinct Pokémon knowledge game modes
- Daily seeded challenges
- Generation selection from Generation 1 through Generation 9
- Pokémon typings that respect historical generation changes
- Persistent local Pokédex progression
- Daily and historical score tracking
- Smart Pokémon autocomplete
- Optional Pokémon cry sound effects
- Installable Progressive Web App
- Responsive layout for desktop and mobile
- Keyboard-friendly controls
- Accessibility-focused interface
- Local persistence for preferences and game history

## Pokédex

Poketype includes a local Pokédex that tracks the Pokémon you have discovered while playing eligible game modes.

Unlocked Pokémon show their sprite and typing, while undiscovered entries remain hidden. Progress is stored locally in your browser.

Regional and alternate forms are normalized back to their base Pokédex entry where appropriate, so collection progress stays focused on completing the main Pokédex.

## Generation Selection

You can choose which Pokémon generations are included in gameplay.

Poketype currently supports Generations 1 through 9. At least one generation is always kept enabled so a game cannot accidentally be started without any available Pokémon.

For Pokémon whose typing changed between generations, Poketype resolves their typing based on the highest enabled generation. This allows older generation selections to reflect historical typings where relevant.

## Progressive Web App

Poketype can be installed as a Progressive Web App on supported browsers and devices.

Installing the app adds it to your home screen or application launcher for quicker access. Poketype still requires an internet connection and does not currently provide full offline gameplay.

## Running Locally

### Requirements

- Node.js 22+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Development

Start the Vite development server:

```bash
pnpm start
```

### Build

Create a production build:

```bash
pnpm build
```

### Preview

Preview the production build locally:

```bash
pnpm preview
```

### Formatting

Poketype uses Biome for formatting and code-quality checks:

```bash
pnpm format
```

## Tech Stack

- React
- TypeScript
- Vite
- Material UI
- MUI X Charts
- Biome
- PokéAPI-derived Pokémon and move data
- GitHub Actions
- GitHub Pages

## Data

Poketype uses Pokémon data derived from the PokéAPI ecosystem and additional generated datasets maintained as part of the project.

The application uses this data for Pokémon species, typings, forms, generations, moves, and battle effectiveness calculations.

## Project Status

Poketype is under active development.

Existing game modes continue to receive balancing, usability improvements, accessibility work, and new progression features. Additional challenge formats and ways to test Pokémon knowledge may be added over time.

## Contributing

Issues, ideas, and pull requests are welcome.

If you find a bug, have a gameplay suggestion, notice incorrect Pokémon data, or want to improve the codebase, feel free to open an issue or submit a pull request.

## Credits

Pokémon data is provided by and derived from the [PokéAPI](https://pokeapi.co/) community.

Pokémon names, characters, sprites, and related assets are trademarks and copyrights of Nintendo, Game Freak, Creatures Inc., and The Pokémon Company.

Poketype is an unofficial, fan-made project and is not affiliated with or endorsed by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company.
