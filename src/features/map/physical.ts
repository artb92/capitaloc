import type { FeatureCollection, MultiLineString, MultiPolygon, Polygon } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import physical from "@/data/physical.json";

type Layers = "lakes" | "ice" | "deep";
const topology = physical as unknown as Topology<Record<Layers, GeometryCollection>>;

const layer = (name: Layers) =>
  feature(topology, topology.objects[name]) as FeatureCollection<Polygon | MultiPolygon>;

/** Label-free physical features from Natural Earth (see scripts/build-physical.mjs). */
export const lakes = layer("lakes");
export const ice = layer("ice");
/** Ocean deeper than 200 m; the rest of the sea reads as a lighter continental shelf. */
export const deep = layer("deep");

/** Meridians and parallels every `step` degrees, for a subtle grid over the ocean. */
export function graticule(step = 15): FeatureCollection<MultiLineString> {
  const lines: [number, number][][] = [];
  for (let lng = -180; lng <= 180; lng += step) {
    lines.push(Array.from({ length: 33 }, (_, i) => [lng, -80 + i * 5] as [number, number]));
  }
  for (let lat = -75; lat <= 75; lat += step) {
    lines.push(Array.from({ length: 73 }, (_, i) => [-180 + i * 5, lat] as [number, number]));
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "MultiLineString", coordinates: lines },
      },
    ],
  };
}
