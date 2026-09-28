import type { StyleSpecification } from "maplibre-gl";
import { countries } from "./countries";

/**
 * Self-contained, label-free style: no tile server, no API key, and no place names
 * that would give answers away.
 */
export const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    countries: { type: "geojson", data: countries },
  },
  layers: [
    { id: "ocean", type: "background", paint: { "background-color": "#dbeafe" } },
    { id: "land", type: "fill", source: "countries", paint: { "fill-color": "#f8fafc" } },
    {
      id: "borders",
      type: "line",
      source: "countries",
      paint: { "line-color": "#94a3b8", "line-width": 0.6 },
    },
  ],
};
