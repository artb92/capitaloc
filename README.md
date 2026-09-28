# Capitaloc

A daily geography game: each day, 10 countries. Pin each capital on the map before the 5-second
timer runs out; the closer you are, the more points you score.

## Run it locally

Requires Node 22+ and pnpm (`corepack enable` gives you the pinned version).

```sh
pnpm install
pnpm dev
```

Then open **http://localhost:5173**. The page hot-reloads as code changes.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on http://localhost:5173 |
| `pnpm check` | Lint, typecheck and unit tests (same as CI) |
| `pnpm fix` | Format and auto-fix lint issues |
| `pnpm build` | Production build into `dist/` |
| `pnpm preview` | Serve the production build on http://localhost:4173 |

## Stack

Vite, React 19, TypeScript, MapLibre GL (`react-map-gl`), Tailwind CSS v4, Zustand, Vitest, Biome.
Map data: Natural Earth 1:110m via `world-atlas`.

See [CLAUDE.md](CLAUDE.md) for conventions and [docs/decisions.md](docs/decisions.md) for design decisions.
