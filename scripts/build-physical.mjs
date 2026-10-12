// Builds src/data/physical.json: a TopoJSON of label-free physical features for the base map
// (sea, lakes, glaciers, rivers, deep ocean), from Natural Earth.
// Run: pnpm data:physical
import { writeFileSync } from "node:fs";
import mapshaper from "mapshaper";

const NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const OUT = new URL("../src/data/physical.json", import.meta.url);

const get = async (name) => {
  console.log(`Downloading ${name}…`);
  return (await fetch(`${NE}/${name}.geojson`)).text();
};

/**
 * Cleans one Natural Earth layer on its own: -simplify applies to every arc of a dataset,
 * so each layer gets its own detail level before they are combined.
 */
const layer = async (name, source, commands) => {
  const out = await mapshaper.applyCommands(
    `-i in.json name=${name} ${commands} -o format=geojson out.json`,
    { "in.json": await get(source) },
  );
  return out["out.json"];
};

// Intervals are in metres; at the closest zoom (5.5) a pixel is about 2.5 km.
const input = {
  // Sea = everything that isn't land, drawn over the relief so coasts follow the same
  // outlines as the countries. Not simplified: the country borders trace the same coast.
  "sea.json": await layer(
    "land",
    "ne_50m_land",
    "-rectangle bbox=-180,-85.06,180,85.06 name=sea -erase land target=sea -filter-fields ''",
  ),
  // Big lakes only (scalerank 0 is the largest); small ones are noise at country zooms.
  "lakes.json": await layer(
    "lakes",
    "ne_10m_lakes",
    "-filter 'scalerank <= 5' -filter-fields '' -simplify interval=1500 keep-shapes",
  ),
  "ice.json": await layer(
    "ice",
    "ne_50m_glaciated_areas",
    "-filter-fields '' -simplify interval=2500 keep-shapes",
  ),
  // Rivers keep their rank (0 = biggest) so the map can show only major ones when zoomed out.
  "rivers.json": await layer(
    "rivers",
    "ne_10m_rivers_lake_centerlines",
    "-filter 'scalerank <= 8' -rename-fields rank=scalerank -filter-fields rank -simplify interval=4000",
  ),
  // Ocean deeper than 200 m; shallower water (the continental shelf) stays a lighter band.
  // Only its outline matters, so drop specks too small to see.
  "deep.json": await layer(
    "deep",
    "ne_10m_bathymetry_K_200",
    "-filter-fields '' -simplify interval=5000 keep-shapes -filter-islands min-area=2000km2",
  ),
};

const output = await mapshaper.applyCommands(
  "-i sea.json lakes.json ice.json rivers.json deep.json combine-files -o format=topojson quantization=1e5 physical.json",
  input,
);
writeFileSync(OUT, output["physical.json"]);
console.log(`Wrote ${OUT.pathname} (${Math.round(output["physical.json"].length / 1024)} kB)`);
