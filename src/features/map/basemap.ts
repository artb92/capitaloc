import { create } from "zustand";
import { persist } from "zustand/middleware";

export const BASEMAPS = ["satellite", "relief"] as const;
export type Basemap = (typeof BASEMAPS)[number];

type BasemapState = { basemap: Basemap; toggle: () => void };

/** Which base map is shown; switchable from the dev header, remembered across reloads. */
export const useBasemap = create<BasemapState>()(
  persist(
    (set) => ({
      basemap: "satellite",
      toggle: () => set((s) => ({ basemap: s.basemap === "satellite" ? "relief" : "satellite" })),
    }),
    { name: "capitaloc:basemap" },
  ),
);
