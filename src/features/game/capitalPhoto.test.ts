import { fetchPhoto } from "./capitalPhoto";

describe("fetchPhoto", () => {
  beforeEach(() => vi.stubGlobal("Image", class {}));
  afterEach(() => vi.unstubAllGlobals());

  it("builds Commons URLs from the Wikidata image claim", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          claims: { P18: [{ mainsnak: { datavalue: { value: "Grand Place.jpg" } } }] },
        }),
      })),
    );
    expect(await fetchPhoto("Q1")).toEqual({
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Grand_Place.jpg?width=800",
      page: "https://commons.wikimedia.org/wiki/File:Grand_Place.jpg",
    });
  });

  it("returns null when there is no image or the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ json: async () => ({ claims: {} }) })),
    );
    expect(await fetchPhoto("Q2")).toBeNull();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("offline"))),
    );
    expect(await fetchPhoto("Q3")).toBeNull();
  });
});
