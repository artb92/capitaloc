// Builds src/data/physical.json: a TopoJSON of label-free physical features for the base map
// (lakes, glaciers, deep ocean), from Natural Earth.
// Run: pnpm data:physical
import { writeFileSync } from "node:fs";
import mapshaper from "mapshaper";

const NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const OUT = new URL("../src/data/physical.json", import.meta.url);

const get = async (name) => {
  console.log(`Downloading ${name}…`);
  return (await fetch(`${NE}/${name}.geojson`)).text();
};

const input = {
  "lakes.json": await get("ne_50m_lakes"),
  "ice.json": await get("ne_50m_glaciated_areas"),
  // Ocean deeper than 200 m; shallower water (the continental shelf) stays a lighter band.
  "deep.json": await get("ne_10m_bathymetry_K_200"),
};

const cmd = [
  "-i lakes.json ice.json deep.json combine-files",
  "-filter-fields target=* ''",
  "-simplify 25% keep-shapes target=lakes,ice",
  // Deep water only needs its outline at world zooms; drop specks too small to see.
  "-simplify 3% target=deep",
  "-filter-islands min-area=500km2 target=deep",
  "-o format=topojson quantization=1e5 physical.json target=*",
].join(" ");

const output = await mapshaper.applyCommands(cmd, input);
writeFileSync(OUT, output["physical.json"]);
console.log(`Wrote ${OUT.pathname} (${Math.round(output["physical.json"].length / 1024)} kB)`);
