// Builds src/data/physical.json: a TopoJSON of label-free physical features for the base map
// (lakes, glaciers, deserts, mountain ranges, tundra), from Natural Earth 1:50m.
// Run: pnpm data:physical
import { writeFileSync } from "node:fs";
import mapshaper from "mapshaper";

const NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const OUT = new URL("../src/data/physical.json", import.meta.url);

const get = async (name) => {
  console.log(`Downloading ${name}…`);
  return (await fetch(`${NE}/${name}.geojson`)).text();
};

// Regions keep only the classes that read as terrain texture; names are dropped (no clues).
const KINDS = { Desert: "desert", "Range/mtn": "mountains", Tundra: "tundra" };

const input = {
  "lakes.json": await get("ne_50m_lakes"),
  "ice.json": await get("ne_50m_glaciated_areas"),
  "regions.json": await get("ne_50m_geography_regions_polys"),
};

const cmd = [
  "-i lakes.json ice.json regions.json combine-files",
  `-filter target=regions '${JSON.stringify(Object.keys(KINDS))}.includes(FEATURECLA)'`,
  `-each target=regions 'kind = (${JSON.stringify(KINDS)})[FEATURECLA]'`,
  "-filter-fields target=regions kind",
  "-filter-fields target=lakes,ice ''",
  "-simplify 25% keep-shapes target=*",
  "-o format=topojson quantization=1e5 physical.json target=*",
].join(" ");

const output = await mapshaper.applyCommands(cmd, input);
writeFileSync(OUT, output["physical.json"]);
console.log(`Wrote ${OUT.pathname} (${Math.round(output["physical.json"].length / 1024)} kB)`);
