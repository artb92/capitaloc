import type { StyleSpecification } from "maplibre-gl";
import type { Basemap } from "./basemap";
import { countries } from "./countries";
import { deep, ice, lakes, rivers, sea } from "./physical";
import { TILES_MAX_Z, tileUrl } from "./tiles";

const WATER = "#3f7896";
const SEA = "#2b5673";
/** Lowland colour of the relief tiles, shown for the instant before a tile is decoded. */
const LAND = "#a9bf8f";

export const TERRAIN_ATTRIBUTION =
  '<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noreferrer">Terrain: Mapzen, AWS, SRTM, GMTED, ETOPO1</a> · <a href="https://www.naturalearthdata.com" target="_blank" rel="noreferrer">Natural Earth</a>';

/**
 * Empty layer marking where the country highlight goes (under water and borders). Same id in
 * every style, so switching styles never points the highlight at a missing layer.
 */
export const HIGHLIGHT_ANCHOR = "highlight-anchor";
const anchor = {
  id: HIGHLIGHT_ANCHOR,
  type: "background",
  paint: { "background-opacity": 0 },
} as const;

/**
 * Physical map: shaded relief tiles prebuilt into public/relief (scripts/build-relief.mjs),
 * so nothing loads from a remote server. Sea, lakes, rivers and borders are Natural Earth
 * vectors drawn on top, so coasts line up with the country shapes. No labels, roads or
 * cities: they would give answers away.
 */
const reliefStyle: StyleSpecification = {
  version: 8,
  sources: {
    relief: {
      type: "raster",
      tiles: [tileUrl("relief")],
      tileSize: 256,
      maxzoom: TILES_MAX_Z,
      attribution: TERRAIN_ATTRIBUTION,
    },
    countries: { type: "geojson", data: countries },
    sea: { type: "geojson", data: sea },
    deep: { type: "geojson", data: deep },
    ice: { type: "geojson", data: ice },
    lakes: { type: "geojson", data: lakes },
    rivers: { type: "geojson", data: rivers },
  },
  layers: [
    { id: "land", type: "background", paint: { "background-color": LAND } },
    { id: "relief", type: "raster", source: "relief", paint: { "raster-fade-duration": 0 } },
    { id: "sea", type: "fill", source: "sea", paint: { "fill-color": SEA } },
    { id: "deep", type: "fill", source: "deep", paint: { "fill-color": "#1d3f58" } },
    anchor,
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
      filter: ["<=", ["get", "rank"], ["step", ["zoom"], 3, 2, 5, 4, 7]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": WATER,
        // Major rivers (low rank) drawn thicker than tributaries.
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          1,
          0.5,
          6,
          ["-", 2.2, ["*", 0.2, ["get", "rank"]]],
        ],
        "line-opacity": 0.8,
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

const SATELLITE_ATTRIBUTION =
  '<a href="https://earthobservatory.nasa.gov/features/BlueMarble" target="_blank" rel="noreferrer">Imagery: NASA Blue Marble</a> via <a href="https://www.npmjs.com/package/@freetiler/nasa-bluemarble" target="_blank" rel="noreferrer">FreeTiler</a> · <a href="https://www.naturalearthdata.com" target="_blank" rel="noreferrer">Natural Earth</a>';

/**
 * Cloud-free satellite imagery (NASA Blue Marble, prebuilt into public/satellite by
 * scripts/build-satellite.mjs) with only country borders on top.
 */
const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [tileUrl("satellite")],
      tileSize: 256,
      maxzoom: TILES_MAX_Z,
      attribution: SATELLITE_ATTRIBUTION,
    },
    countries: { type: "geojson", data: countries },
  },
  layers: [
    { id: "ocean", type: "background", paint: { "background-color": "#0e2f5c" } },
    {
      id: "satellite",
      type: "raster",
      source: "satellite",
      paint: { "raster-fade-duration": 0 },
    },
    anchor,
    {
      id: "borders",
      type: "line",
      source: "countries",
      layout: { "line-join": "round" },
      paint: {
        "line-color": "#ffffff",
        "line-opacity": 0.45,
        "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.4, 6, 1.1],
      },
    },
  ],
};

export const mapStyles: Record<Basemap, StyleSpecification> = {
  relief: reliefStyle,
  satellite: satelliteStyle,
};
