import type { StyleSpecification } from "maplibre-gl";
import { countries } from "./countries";
import { graticule, ice, lakes, regions } from "./physical";

export const OCEAN = "#cfe2ef";
const LAND = "#f6f3ec";

/**
 * Self-contained, label-free style: no tile server, no API key, and no place names
 * that would give answers away. Physical features add texture without pointing at cities.
 */
export const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    countries: { type: "geojson", data: countries },
    regions: { type: "geojson", data: regions },
    ice: { type: "geojson", data: ice },
    lakes: { type: "geojson", data: lakes },
    graticule: { type: "geojson", data: graticule() },
  },
  layers: [
    { id: "ocean", type: "background", paint: { "background-color": OCEAN } },
    {
      id: "graticule",
      type: "line",
      source: "graticule",
      paint: { "line-color": "#b7d0e2", "line-width": 0.6 },
    },
    {
      id: "coast-halo",
      type: "line",
      source: "countries",
      paint: {
        "line-color": "#e3eef6",
        "line-width": ["interpolate", ["linear"], ["zoom"], 1, 3, 6, 8],
      },
    },
    { id: "land", type: "fill", source: "countries", paint: { "fill-color": LAND } },
    {
      id: "regions",
      type: "fill",
      source: "regions",
      paint: {
        "fill-color": [
          "match",
          ["get", "kind"],
          "desert",
          "#efdfba",
          "mountains",
          "#ddd3c1",
          "tundra",
          "#e4ebe6",
          LAND,
        ],
        "fill-opacity": 0.75,
        "fill-antialias": false,
      },
    },
    {
      id: "ice",
      type: "fill",
      source: "ice",
      paint: { "fill-color": "#ffffff", "fill-opacity": 0.9 },
    },
    { id: "lakes", type: "fill", source: "lakes", paint: { "fill-color": OCEAN } },
    {
      id: "borders",
      type: "line",
      source: "countries",
      paint: {
        "line-color": "#8f8a80",
        "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.4, 6, 1.2],
      },
    },
  ],
};
