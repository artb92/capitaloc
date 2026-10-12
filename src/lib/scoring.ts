export const MAX_ROUND_SCORE = 1000;

/**
 * Distance (km) at which a guess earns half the points. It scales with the country's
 * linear size (√area), so 100 km off is great for Russia but poor for Belgium.
 *   Belgium ≈ 87 km · France ≈ 370 km · Russia/USA → capped at 1,000 km.
 */
export function halfScoreDistanceKm(areaKm2: number): number {
  return Math.min(1000, Math.max(30, 0.5 * Math.sqrt(areaKm2)));
}

/** Answers within this time keep full points. */
export const FULL_SPEED_MS = 1000;
/** Share of the distance score kept when answering at the last moment. */
export const SLOWEST_FACTOR = 0.7;

/** Speed multiplier: 1 up to 1 s, then linear down to 0.7 at the end of the round. */
export function speedFactor(elapsedMs: number, roundMs: number): number {
  const t = Math.min(1, Math.max(0, (elapsedMs - FULL_SPEED_MS) / (roundMs - FULL_SPEED_MS)));
  return 1 - (1 - SLOWEST_FACTOR) * t;
}

/** Points for one round: full within a small radius, then halves every `half` km. */
export function roundScore(distanceKm: number | null, areaKm2: number): number {
  if (distanceKm === null) return 0;
  const half = halfScoreDistanceKm(areaKm2);
  if (distanceKm <= half / 10) return MAX_ROUND_SCORE;
  return Math.round(MAX_ROUND_SCORE * 0.5 ** (distanceKm / half));
}
