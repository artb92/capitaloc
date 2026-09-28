import { countries, unwrapRing } from "./countries";

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
