import type { FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-50m.json";

export type CountryProps = {
  name: string;
  id: string /** 0–4, neighbours never share one. */;
  color: number;
};
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

/** Natural Earth 1:50m country polygons, converted once at module load. */
export const countries: FeatureCollection<Polygon | MultiPolygon, CountryProps> = {
  ...raw,
  features: raw.features.map((f) => ({
    ...f,
    // Copy the ISO numeric id into properties: MapLibre drops string feature ids.
    properties: { ...f.properties, id: String(f.id) },
    geometry: unwrapGeometry(f.geometry),
  })),
};

export type Bounds = [west: number, south: number, east: number, north: number];

/**
 * Bounding box of a country's largest polygon, so e.g. France frames mainland France
 * rather than stretching to French Guiana. `include` (e.g. the capital) is always framed,
 * so Kuala Lumpur stays in view even though Malaysian Borneo is the bigger polygon.
 */
export function countryBounds(id: string, include?: readonly [number, number]): Bounds | null {
  const f = countries.features.find((c) => c.properties.id === id);
  if (!f) return null;
  const polygons =
    f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  let best: Bounds | null = null;
  let bestArea = -1;
  for (const [outer = []] of polygons) {
    const lngs = outer.map((p) => p[0] ?? 0);
    const lats = outer.map((p) => p[1] ?? 0);
    const box: Bounds = [
      Math.min(...lngs),
      Math.min(...lats),
      Math.max(...lngs),
      Math.max(...lats),
    ];
    const area = (box[2] - box[0]) * (box[3] - box[1]);
    if (area > bestArea) [best, bestArea] = [box, area];
  }
  if (!best || !include) return best;
  const [lng, lat] = include;
  return [
    Math.min(best[0], lng),
    Math.min(best[1], lat),
    Math.max(best[2], lng),
    Math.max(best[3], lat),
  ];
}
