export const MAX_ROUND_SCORE = 1000;

/**
 * Distance (km) at which a guess earns half the points. It scales with the country's
 * linear size (√area), so 100 km off is great for Russia but poor for Belgium.
 *   Belgium ≈ 87 km · France ≈ 370 km · Russia/USA → capped at 1,000 km.
 */
export function halfScoreDistanceKm(areaKm2: number): number {
  return Math.min(1000, Math.max(30, 0.5 * Math.sqrt(areaKm2)));
}

/** Points for one round: full within a small radius, then halves every `half` km. */
export function roundScore(distanceKm: number | null, areaKm2: number): number {
  if (distanceKm === null) return 0;
  const half = halfScoreDistanceKm(areaKm2);
  if (distanceKm <= half / 10) return MAX_ROUND_SCORE;
  return Math.round(MAX_ROUND_SCORE * 0.5 ** (distanceKm / half));
}
