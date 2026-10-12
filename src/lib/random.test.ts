import { hashString, mulberry32, sample } from "./random";

describe("random", () => {
  it("hashString is stable and spreads nearby inputs", () => {
    expect(hashString("2026-09-28")).toBe(hashString("2026-09-28"));
    expect(hashString("2026-09-28")).not.toBe(hashString("2026-09-29"));
  });

  it("mulberry32 is deterministic and in [0, 1)", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it("sample returns distinct items, deterministically, without mutating input", () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const picked = sample(items, 10, mulberry32(1));
    expect(new Set(picked).size).toBe(10);
    expect(sample(items, 10, mulberry32(1))).toEqual(picked);
    expect(items).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });

  it("sample caps at the number of items", () => {
    expect(sample([1, 2], 5, mulberry32(1))).toHaveLength(2);
  });
});
