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
| `pnpm data:countries` | Rebuild the country and capital dataset |
| `pnpm data:physical` | Rebuild the physical base-map layers |
| `pnpm data:relief` | Rebuild the shaded-relief tiles in `public/relief` |
| `pnpm data:satellite` | Rebuild the satellite tiles in `public/satellite` |

## Stack

Vite, React 19, TypeScript, MapLibre GL (`react-map-gl`), Tailwind CSS v4, Zustand, Vitest, Biome.
Map data: Natural Earth 1:50m via `world-atlas`.

Country data: [world-countries](https://github.com/mledoze/countries) (ODbL) and [Natural Earth](https://www.naturalearthdata.com/) populated places and physical layers (public domain). Satellite tiles: [NASA Blue Marble](https://earthobservatory.nasa.gov/features/BlueMarble) (public domain), packaged by [FreeTiler](https://www.npmjs.com/package/@freetiler/nasa-bluemarble). Relief tiles are prebuilt from [AWS Open Data Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen; SRTM, GMTED, ETOPO1 and others), credited on the map. Capital photos: [Wikimedia Commons](https://commons.wikimedia.org/) via Wikidata, credited on each photo, regenerated with `pnpm data:countries`.

See [CLAUDE.md](CLAUDE.md) for conventions and [docs/decisions.md](docs/decisions.md) for design decisions.
