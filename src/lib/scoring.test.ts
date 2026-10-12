import {
  halfScoreDistanceKm,
  MAX_ROUND_SCORE,
  roundScore,
  SLOWEST_FACTOR,
  speedFactor,
} from "./scoring";

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

describe("speedFactor", () => {
  it("keeps full points for quick answers", () => {
    expect(speedFactor(0, 5000)).toBe(1);
    expect(speedFactor(1000, 5000)).toBe(1);
  });

  it("slides down to the slowest factor at the end of the round", () => {
    expect(speedFactor(3000, 5000)).toBeCloseTo(0.85);
    expect(speedFactor(5000, 5000)).toBeCloseTo(SLOWEST_FACTOR);
    expect(speedFactor(9000, 5000)).toBeCloseTo(SLOWEST_FACTOR);
  });
});
