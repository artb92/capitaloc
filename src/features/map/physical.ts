import type { FeatureCollection, MultiLineString, MultiPolygon, Polygon } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import physical from "@/data/physical.json";

type Layers = "sea" | "lakes" | "ice" | "rivers" | "deep";
const topology = physical as unknown as Topology<Record<Layers, GeometryCollection>>;

const layer = <G extends Polygon | MultiPolygon | MultiLineString>(name: Layers) =>
  feature(topology, topology.objects[name]) as FeatureCollection<G>;

/** Label-free physical features from Natural Earth (see scripts/build-physical.mjs). */
/** Everything that isn't land; drawn over the relief so coasts follow the country outlines. */
export const sea = layer<Polygon | MultiPolygon>("sea");
export const lakes = layer<Polygon | MultiPolygon>("lakes");
export const ice = layer<Polygon | MultiPolygon>("ice");
/** Major rivers with a `rank` property (0 = biggest). */
export const rivers = layer<MultiLineString>("rivers");
/** Ocean deeper than 200 m. */
export const deep = layer<Polygon | MultiPolygon>("deep");
