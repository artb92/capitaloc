import type { Bounds } from "./countries";

/** Highest zoom of the prebuilt relief tiles (public/relief). */
export const RELIEF_MAX_Z = 6;

/** XYZ (Web Mercator) tiles covering `bounds` at zoom `z`, as "z/x/y" keys. */
export function tilesForBounds([west, south, east, north]: Bounds, z: number): string[] {
  const n = 2 ** z;
  const clamp = (v: number) => Math.min(n - 1, Math.max(0, Math.floor(v)));
  const x = (lng: number) => clamp(((lng + 180) / 360) * n);
  const y = (lat: number) => {
    const r = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
    return clamp(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n);
  };
  const keys: string[] = [];
  for (let tx = x(west); tx <= x(east); tx++) {
    for (let ty = y(north); ty <= y(south); ty++) keys.push(`${z}/${tx}/${ty}`);
  }
  return keys;
}

/**
 * Warms the browser cache with the relief tiles a country's close-up will need, so the
 * map is sharp the moment the camera arrives. Pads the box since the camera shows more, and
 * skips zooms where the country spans many tiles: the camera won't zoom that far in.
 */
export function preloadRelief(bounds: Bounds): void {
  const [w, s, e, n] = bounds;
  const pad = Math.max(e - w, n - s) / 2;
  const padded: Bounds = [w - pad, s - pad, e + pad, n + pad];
  for (let z = 2; z <= RELIEF_MAX_Z; z++) {
    const keys = tilesForBounds(padded, z);
    if (keys.length > 30) break;
    for (const key of keys) {
      new Image().src = `${import.meta.env.BASE_URL}relief/${key}.webp`;
    }
  }
}
