import type { FeatureCollection, MultiLineString, MultiPolygon, Polygon } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import physical from "@/data/physical.json";

type Layers = "lakes" | "ice" | "rivers" | "deep";
const topology = physical as unknown as Topology<Record<Layers, GeometryCollection>>;

const layer = <G extends Polygon | MultiPolygon | MultiLineString>(name: Layers) =>
  feature(topology, topology.objects[name]) as FeatureCollection<G>;

/** Label-free physical features from Natural Earth (see scripts/build-physical.mjs). */
export const lakes = layer<Polygon | MultiPolygon>("lakes");
export const ice = layer<Polygon | MultiPolygon>("ice");
/** Major rivers with a `rank` property (0 = biggest). */
export const rivers = layer<MultiLineString>("rivers");
/** Ocean deeper than 200 m; fallback sea depth when the terrain tiles can't load. */
export const deep = layer<Polygon | MultiPolygon>("deep");
