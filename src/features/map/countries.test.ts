import { colorIndexes, countries, countryBounds, unwrapRing } from "./countries";

describe("countries", () => {
  it("loads named country polygons", () => {
    expect(countries.features.length).toBeGreaterThan(150);
    expect(countries.features.map((f) => f.properties.name)).toContain("France");
  });
});

describe("unwrapRing", () => {
  it("keeps rings continuous across the antimeridian", () => {
    expect(
      unwrapRing([
        [179, 60],
        [-179, 61],
        [-178, 60],
      ]),
    ).toEqual([
      [179, 60],
      [181, 61],
      [182, 60],
    ]);
  });

  it("leaves ordinary rings untouched", () => {
    const ring = [
      [2, 48],
      [3, 49],
      [2, 48],
    ];
    expect(unwrapRing(ring)).toEqual(ring);
  });
});

describe("countryBounds", () => {
  it("frames mainland France, not its overseas territories", () => {
    const [w, s, e, n] = countryBounds("250") ?? [];
    expect(w).toBeGreaterThan(-6);
    expect(e).toBeLessThan(10);
    expect(s).toBeGreaterThan(41);
    expect(n).toBeLessThan(52);
  });

  it("returns null for unknown ids", () => {
    expect(countryBounds("999")).toBeNull();
  });
});

describe("countryBounds with an included point", () => {
  it("keeps Kuala Lumpur in frame for Malaysia", () => {
    const [w = 0, s = 0, e = 0, n = 0] = countryBounds("458", [101.69, 3.14]) ?? [];
    expect(w <= 101.69 && 101.69 <= e && s <= 3.14 && 3.14 <= n).toBe(true);
  });
});

describe("colorIndexes", () => {
  it("never gives neighbours the same colour on the real map", () => {
    const byId = new Map(countries.features.map((f) => [f.properties.id, f.properties.color]));
    // France borders Spain, Belgium, Germany, Switzerland, Italy.
    const france = byId.get("250");
    for (const id of ["724", "056", "276", "756", "380"]) expect(byId.get(id)).not.toBe(france);
  });

  it("colours a small graph properly", () => {
    // Triangle 0-1-2 plus 3 attached to 0.
    const c = colorIndexes([[1, 2, 3], [0, 2], [0, 1], [0]]);
    expect(new Set([c[0], c[1], c[2]]).size).toBe(3);
    expect(c[3]).not.toBe(c[0]);
  });
});
