import { distanceKm, type LngLat } from "./geo";

const PARIS: LngLat = [2.3522, 48.8566];
const LONDON: LngLat = [-0.1276, 51.5072];

describe("distanceKm", () => {
  it("is zero for the same point", () => {
    expect(distanceKm(PARIS, PARIS)).toBe(0);
  });

  it("matches the known Paris–London distance", () => {
    expect(distanceKm(PARIS, LONDON)).toBeCloseTo(344, -1);
  });

  it("is symmetric", () => {
    expect(distanceKm(PARIS, LONDON)).toBeCloseTo(distanceKm(LONDON, PARIS), 9);
  });

  it("handles antipodes", () => {
    expect(distanceKm([0, 0], [180, 0])).toBeCloseTo(Math.PI * 6371.0088, 3);
  });
});
