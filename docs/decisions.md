# Decisions

One line per decision, newest last. Format: `YYYY-MM-DD: decision (why)`.

- 2026-09-28: Vite + React + MapLibre SPA, no backend (daily puzzle can be derived from the date with a seeded RNG).
- 2026-09-28: Self-contained label-free map from Natural Earth 110m via `world-atlas` (no API key, no answer leaks).
- 2026-09-28: Biome instead of ESLint + Prettier (one fast tool, one config).
- 2026-09-28: Scoring: up to 1,000 per round, halving every `0.5·√area` km (clamped 30–1,000 km), full points within a tenth of that. Size-weighted per Arthur (100 km off is fine for Russia, not for Belgium).
- 2026-09-28: After each pin, reveal capital, distance and points for 2.5 s, then auto-advance. First click is final. 5 s countdown before round 1 only.
- 2026-09-28: Map frames the country's largest polygon plus its capital, with neighbours visible (maxZoom 5.5).
- 2026-09-28: Country pool: independent countries drawable at 1:110m (165), i.e. microstates and small island nations excluded.
- 2026-09-28: No sharing for now. One play per day; results and streak kept in localStorage. Puzzle flips at the player's local midnight.
- 2026-09-28: English and French; language auto-detected, toggle in header.
- 2026-10-12: Speed bonus: distance score kept in full up to 1 s, sliding linearly to 70% at 5 s (chosen by Arthur).
- 2026-10-12: Capital photo per round: Wikidata P18 image of the capital, fetched at runtime from Wikimedia (unreachable from the build sandbox), hidden if missing.
- 2026-10-12: Dev builds show a "Reset (dev)" button that clears today's result.
- 2026-10-12: Countdown 3 s. Each round starts with a 0.9 s camera flight; the 5 s timer starts after it and clicks during it are ignored.
- 2026-10-12: Visual direction "night chart": deep-ocean ink blue (shelf lighter than deep water), soft 5-colour political tints, one accent (amber) for the highlighted country. Replaced the violet→rose gradient, cream land and region blobs. No rivers, roads, cities or labels (they would hint at capitals).
- 2026-10-12: Score colours are data: green ≥ 750, amber ≥ 300, red > 0, grey = no answer (`src/app/tier.ts`).
- 2026-10-12: Brand: white pin with an amber star (the map symbol for a capital) on ink blue; Bricolage Grotesque for all text.
