import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, LineString } from "geojson";
import { useEffect, useMemo, useRef } from "react";
import { Layer, Map as MapLibre, type MapRef, Marker, Source } from "react-map-gl/maplibre";
import type { LngLat } from "@/lib/geo";
import { countryBounds } from "./countries";
import { mapStyle } from "./mapStyle";

const WORLD_VIEW = { center: [10, 25] as [number, number], zoom: 1.2 };

type Props = {
  /** Country to highlight and frame; null shows the whole world. */
  focusId: string | null;
  /** Point that must stay in frame along with the focused country (its capital). */
  focusInclude?: LngLat;
  pin: LngLat | null;
  answer: LngLat | null;
  onPick?: (lngLat: LngLat) => void;
};

export function WorldMap({ focusId, focusInclude, pin, answer, onPick }: Props) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = focusId ? countryBounds(focusId, focusInclude) : null;
    if (bounds) {
      const [w, s, e, n] = bounds;
      map.fitBounds(
        [
          [w, s],
          [e, n],
        ],
        { padding: { top: 260, bottom: 40, left: 40, right: 40 }, maxZoom: 5.5, duration: 0 }, // instant: a click would cancel an animated move mid-round
      );
    } else {
      map.flyTo({ ...WORLD_VIEW, duration: 600 });
    }
  }, [focusId, focusInclude]);

  const line = useMemo<FeatureCollection<LineString> | null>(
    () =>
      pin && answer
        ? {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: [[...pin], [...answer]] },
              },
            ],
          }
        : null,
    [pin, answer],
  );

  return (
    <MapLibre
      ref={mapRef}
      initialViewState={{
        longitude: WORLD_VIEW.center[0],
        latitude: WORLD_VIEW.center[1],
        zoom: WORLD_VIEW.zoom,
      }}
      mapStyle={mapStyle}
      style={{ position: "absolute", inset: 0 }}
      cursor={onPick ? "crosshair" : "grab"}
      dragRotate={false}
      touchPitch={false}
      attributionControl={false}
      onClick={(e) => {
        const { lng, lat } = e.lngLat.wrap();
        onPick?.([lng, lat]);
      }}
    >
      <Layer
        id="highlight"
        type="fill"
        source="countries"
        beforeId="borders"
        filter={["==", ["get", "id"], focusId ?? ""]}
        paint={{ "fill-color": "#fb7185", "fill-opacity": 0.35 }}
      />
      <Layer
        id="highlight-outline"
        type="line"
        source="countries"
        filter={["==", ["get", "id"], focusId ?? ""]}
        paint={{ "line-color": "#e11d48", "line-width": 2 }}
      />
      {line && (
        <Source id="guess-line" type="geojson" data={line}>
          <Layer
            id="guess-line"
            type="line"
            paint={{ "line-color": "#334155", "line-width": 2, "line-dasharray": [2, 2] }}
          />
        </Source>
      )}
      {pin && (
        <Marker longitude={pin[0]} latitude={pin[1]} anchor="bottom">
          <svg width="26" height="34" viewBox="0 0 26 34" aria-label="Your pin" role="img">
            <path d="M13 33 3 18a11 11 0 1 1 20 0z" fill="#e11d48" stroke="#fff" strokeWidth="2" />
            <circle cx="13" cy="12" r="4" fill="#fff" />
          </svg>
        </Marker>
      )}
      {answer && (
        <Marker longitude={answer[0]} latitude={answer[1]} anchor="center">
          <span
            aria-label="Capital"
            role="img"
            className="block size-4 rounded-full border-[3px] border-white bg-emerald-600 shadow-md ring-4 ring-emerald-600/30"
          />
        </Marker>
      )}
    </MapLibre>
  );
}
