# Capitaloc

Daily geography game: 10 countries per day, the player pins each capital on a map within 5 s;
score depends on distance. Static SPA, no backend (for now).

## Stack
Vite 8 · React 19 · TypeScript (strict) · MapLibre GL via `react-map-gl/maplibre` · Tailwind v4 ·
Zustand (game state) · Vitest + Testing Library · Biome (lint + format) · pnpm.

## Commands
- `pnpm dev`: dev server at http://localhost:5173 (strict port)
- `pnpm check`: lint + typecheck + tests. **Run before every commit.**
- `pnpm fix`: auto-format and fix lint
- `pnpm test -- <pattern>`: run a subset of tests
- `pnpm build` / `pnpm preview` (http://localhost:4173)

## Layout
- `src/app/`: app shell, screens
- `src/features/<feature>/`: feature code, colocated tests (`*.test.ts[x]`)
- `src/lib/`: pure, framework-free helpers (geo math, seeded RNG, scoring)
- Import from `src` with the `@/` alias

## Conventions
- Keep game logic pure and in `src/lib` or `features/*/logic.ts`; components stay thin.
- Unit-test every pure function; no snapshot tests.
- Map style is self-contained and label-free (`features/map/mapStyle.ts`): never add a
  tile source with place names, it would reveal answers.
- Named exports only; no default exports except where a tool requires one.
- Conventional commits (`feat:`, `fix:`, `chore:` …).

## Gotchas
- `maplibre-gl` v6 must stay in `optimizeDeps.exclude` (vite.config.ts) or its worker fails to load.
- `world-atlas` rings are spherical; `unwrapRing` in `features/map/countries.ts` fixes antimeridian stripes.

## Token hygiene (for Claude)
- Don't read `pnpm-lock.yaml`, `node_modules/`, `dist/` or geo data JSON; they are denied in
  `.claude/settings.json`. Inspect data with a short `node -e` script that prints a summary.
- Prefer `pnpm check` output tails (`| tail -30`) over full logs.
- Record product decisions in `docs/decisions.md`, one line each, instead of re-deriving them.
