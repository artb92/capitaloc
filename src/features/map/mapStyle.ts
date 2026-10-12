import type { StyleSpecification } from "maplibre-gl";
import { countries } from "./countries";
import { deep, graticule, ice, lakes } from "./physical";

/** Shallow water (continental shelf); deep ocean is drawn darker on top. */
export const SHELF = "#2b5673";
const DEEP = "#1d3f58";
/** Soft, cool political tints; the greedy colouring keeps neighbours apart. */
const LAND = ["#e4e7e1", "#d9e2d6", "#e6e0d2", "#dadfe6", "#e3dbdf"] as const;

/**
 * Self-contained, label-free style: no tile server, no API key, and no place names
 * that would give answers away.
 */
export const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    countries: { type: "geojson", data: countries },
    deep: { type: "geojson", data: deep },
    ice: { type: "geojson", data: ice },
    lakes: { type: "geojson", data: lakes },
    graticule: { type: "geojson", data: graticule() },
  },
  layers: [
    { id: "shelf", type: "background", paint: { "background-color": SHELF } },
    { id: "deep", type: "fill", source: "deep", paint: { "fill-color": DEEP } },
    {
      id: "graticule",
      type: "line",
      source: "graticule",
      paint: { "line-color": "#ffffff", "line-opacity": 0.06, "line-width": 0.8 },
    },
    {
      id: "land",
      type: "fill",
      source: "countries",
      paint: {
        "fill-color": [
          "match",
          ["get", "color"],
          1,
          LAND[1],
          2,
          LAND[2],
          3,
          LAND[3],
          4,
          LAND[4],
          LAND[0],
        ],
      },
    },
    {
      id: "ice",
      type: "fill",
      source: "ice",
      paint: { "fill-color": "#f7f9fa", "fill-opacity": 0.85 },
    },
    { id: "lakes", type: "fill", source: "lakes", paint: { "fill-color": "#7fa3bb" } },
    {
      id: "borders",
      type: "line",
      source: "countries",
      paint: {
        "line-color": "#7d8b94",
        "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.35, 6, 1.1],
      },
    },
  ],
};
