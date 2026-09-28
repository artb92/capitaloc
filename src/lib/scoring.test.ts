import { halfScoreDistanceKm, MAX_ROUND_SCORE, roundScore } from "./scoring";

const BELGIUM = 30_528;
const RUSSIA = 17_098_242;

describe("scoring", () => {
  it("gives 0 when the player did not answer", () => {
    expect(roundScore(null, BELGIUM)).toBe(0);
  });

  it("gives full points for a near-perfect pin", () => {
    expect(roundScore(0, BELGIUM)).toBe(MAX_ROUND_SCORE);
    expect(roundScore(5, BELGIUM)).toBe(MAX_ROUND_SCORE);
  });

  it("gives half the points at the half-score distance", () => {
    const half = halfScoreDistanceKm(BELGIUM);
    expect(roundScore(half, BELGIUM)).toBe(500);
  });

  it("weights distance by country size", () => {
    expect(roundScore(100, RUSSIA)).toBeGreaterThan(900);
    expect(roundScore(100, BELGIUM)).toBeLessThan(500);
  });

  it("clamps the half-score distance for tiny and huge countries", () => {
    expect(halfScoreDistanceKm(100)).toBe(30);
    expect(halfScoreDistanceKm(RUSSIA)).toBe(1000);
  });

  it("decreases monotonically with distance", () => {
    let last = Number.POSITIVE_INFINITY;
    for (let d = 0; d <= 5000; d += 250) {
      const s = roundScore(d, 500_000);
      expect(s).toBeLessThanOrEqual(last);
      last = s;
    }
  });
});
