import type { FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";

export type CountryProps = { name: string };
type CountryTopology = Topology<{ countries: GeometryCollection<CountryProps> }>;

/**
 * world-atlas rings are spherical (made for d3-geo), so rings crossing the antimeridian
 * jump from +180 to -180 and draw stripes across a planar map. Keep each ring continuous
 * instead (e.g. eastern Russia goes past 180); MapLibre wraps it back correctly.
 */
export function unwrapRing(ring: Position[]): Position[] {
  let offset = 0;
  return ring.map(([lng = 0, lat = 0], i) => {
    const prev = ring[i - 1]?.[0];
    if (prev !== undefined) {
      if (lng - prev > 180) offset -= 360;
      else if (prev - lng > 180) offset += 360;
    }
    return [lng + offset, lat];
  });
}

function unwrapGeometry(geometry: Polygon | MultiPolygon): Polygon | MultiPolygon {
  return geometry.type === "Polygon"
    ? { ...geometry, coordinates: geometry.coordinates.map(unwrapRing) }
    : { ...geometry, coordinates: geometry.coordinates.map((poly) => poly.map(unwrapRing)) };
}

const topology = world as unknown as CountryTopology;
const raw = feature(topology, topology.objects.countries) as FeatureCollection<
  Polygon | MultiPolygon,
  CountryProps
>;

/** Natural Earth 1:110m country polygons, converted once at module load. */
export const countries: FeatureCollection<Polygon | MultiPolygon, CountryProps> = {
  ...raw,
  features: raw.features.map((f) => ({ ...f, geometry: unwrapGeometry(f.geometry) })),
};
