// Builds src/data/countries.json: playable countries with capital coordinates.
// Sources: world-countries (names, area, independence), Natural Earth 10m populated places
// (capital coordinates + French names), world-atlas 110m (the polygons we can draw).
// Run: pnpm data:countries
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const NE_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson";
const OUT = new URL("../src/data/countries.json", import.meta.url);

const worldCountries = require("world-countries");
const topology = JSON.parse(
  readFileSync(require.resolve("world-atlas/countries-110m.json"), "utf8"),
);
const polygonIds = new Set(topology.objects.countries.geometries.map((g) => g.id));

console.log("Downloading Natural Earth populated places…");
const places = (await (await fetch(NE_URL)).json()).features.map((f) => f.properties);

// Countries whose capital Natural Earth does not flag with ADM0CAP.
const CAPITAL_FALLBACK = { SSD: "Juba" };

const round = (n) => Math.round(n * 1e4) / 1e4;
const missing = [];

const countries = worldCountries
  // "Smaller countries" = too small to be drawn at 1:110m (microstates, small islands).
  .filter((c) => c.independent && polygonIds.has(c.ccn3))
  .map((c) => {
    const inCountry = places.filter((p) => p.ADM0_A3 === c.cca3 || p.SOV_A3 === c.cca3);
    const wanted = CAPITAL_FALLBACK[c.cca3] ?? c.capital[0];
    const capital =
      inCountry.find((p) => p.ADM0CAP === 1 && p.NAME === wanted) ??
      inCountry.find((p) => p.NAME === wanted) ??
      inCountry.find((p) => p.ADM0CAP === 1 && p.ADM0_A3 === c.cca3);
    if (!capital) {
      missing.push(c.cca3);
      return null;
    }
    return {
      id: c.ccn3,
      code: c.cca3,
      name: { en: c.name.common, fr: c.translations.fra.common },
      capital: { en: capital.NAME_EN ?? capital.NAME, fr: capital.NAME_FR ?? capital.NAME },
      lngLat: [round(capital.LONGITUDE), round(capital.LATITUDE)],
      areaKm2: c.area,
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.code.localeCompare(b.code));

if (missing.length) throw new Error(`No capital found for: ${missing.join(", ")}`);
writeFileSync(OUT, `${JSON.stringify(countries, null, 1)}\n`);
console.log(`Wrote ${countries.length} countries to ${OUT.pathname}`);
