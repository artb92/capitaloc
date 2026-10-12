import type { StyleSpecification } from "maplibre-gl";
import { countries } from "./countries";
import { deep, ice, lakes, rivers } from "./physical";

const WATER = "#3f7896";
/** Neutral land under the relief, visible only if the terrain tiles fail to load. */
const LAND = "#dfe4d8";

export const TERRAIN_ATTRIBUTION =
  '<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noreferrer">Terrain: Mapzen, AWS, SRTM, GMTED, ETOPO1</a> · <a href="https://www.naturalearthdata.com" target="_blank" rel="noreferrer">Natural Earth</a>';

/**
 * Physical map: elevation colours and hill shading from open terrain tiles (no API key),
 * rivers, lakes and borders from Natural Earth. No labels, roads or cities: they would give
 * answers away.
 */
export const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    terrain: {
      type: "raster-dem",
      // AWS Open Data "Terrain Tiles" (Mapzen terrarium encoding), land elevation and sea depth.
      tiles: ["https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png"],
      encoding: "terrarium",
      tileSize: 256,
      maxzoom: 9,
      attribution: TERRAIN_ATTRIBUTION,
    },
    countries: { type: "geojson", data: countries },
    deep: { type: "geojson", data: deep },
    ice: { type: "geojson", data: ice },
    lakes: { type: "geojson", data: lakes },
    rivers: { type: "geojson", data: rivers },
  },
  layers: [
    { id: "sea", type: "background", paint: { "background-color": "#2b5673" } },
    { id: "deep", type: "fill", source: "deep", paint: { "fill-color": "#1d3f58" } },
    { id: "land", type: "fill", source: "countries", paint: { "fill-color": LAND } },
    {
      id: "relief-colors",
      type: "color-relief",
      source: "terrain",
      paint: {
        // Hypsometric tints, kept muted: sea depth in blues, then lowland green to snow.
        "color-relief-color": [
          "interpolate",
          ["linear"],
          ["elevation"],
          -8000,
          "#102c42",
          -3000,
          "#1a3f5a",
          -200,
          "#2b5673",
          -1,
          "#4a7f9c",
          0,
          "#a9bf8f",
          300,
          "#c3cc98",
          800,
          "#ddd3a6",
          1500,
          "#cdb487",
          2500,
          "#b39a7c",
          4000,
          "#d9d4ce",
          5500,
          "#ffffff",
        ],
      },
    },
    {
      id: "hillshade",
      type: "hillshade",
      source: "terrain",
      paint: {
        "hillshade-exaggeration": 0.5,
        "hillshade-shadow-color": "#3b3a2e",
        // Translucent highlight: full white made seamounts glow like bubbles on the sea.
        "hillshade-highlight-color": "rgba(255, 255, 255, 0.3)",
        "hillshade-accent-color": "#5c5a48",
      },
    },
    {
      id: "ice",
      type: "fill",
      source: "ice",
      paint: { "fill-color": "#f7f9fa", "fill-opacity": 0.7 },
    },
    { id: "lakes", type: "fill", source: "lakes", paint: { "fill-color": WATER } },
    {
      id: "rivers",
      type: "line",
      source: "rivers",
      // Only the biggest rivers at world view, more as you zoom in.
      filter: ["<=", ["get", "rank"], ["step", ["zoom"], 3, 2, 6, 4, 12]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": WATER,
        "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.6, 6, 1.8],
        "line-opacity": 0.85,
      },
    },
    {
      id: "borders",
      type: "line",
      source: "countries",
      layout: { "line-join": "round" },
      paint: {
        "line-color": "#3d3a33",
        "line-opacity": 0.55,
        "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.4, 6, 1.2],
      },
    },
  ],
};
