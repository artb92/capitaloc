import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, LineString } from "geojson";
import { useEffect, useMemo, useRef } from "react";
import { Layer, Map as MapLibre, type MapRef, Marker, Source } from "react-map-gl/maplibre";
import type { LngLat } from "@/lib/geo";
import { countryBounds } from "./countries";
import { mapStyle } from "./mapStyle";

const WORLD_VIEW = { center: [10, 25] as [number, number], zoom: 1.2 };
const ACCENT = "#f0a830";

type Props = {
  /** Country to highlight and frame; null shows the whole world. */
  focusId: string | null;
  /** Point that must stay in frame along with the focused country (its capital). */
  focusInclude?: LngLat;
  /** Camera flight time when the focus changes. */
  travelMs: number;
  pin: LngLat | null;
  answer: LngLat | null;
  onPick?: (lngLat: LngLat) => void;
};

export function WorldMap({ focusId, focusInclude, travelMs, pin, answer, onPick }: Props) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = focusId ? countryBounds(focusId, focusInclude) : null;
    // Not `essential`: MapLibre skips the flight for people who prefer reduced motion.
    const motion = { duration: travelMs, essential: false };
    if (bounds) {
      const [w, s, e, n] = bounds;
      map.fitBounds(
        [
          [w, s],
          [e, n],
        ],
        {
          ...motion,
          // The round card covers the top; on short windows shrink its allowance so the
          // bounds still fit (fitBounds silently does nothing when padding leaves no room).
          padding: {
            top: Math.min(280, map.getContainer().clientHeight * 0.45),
            bottom: 30,
            left: 30,
            right: 30,
          },
          maxZoom: 5.5,
        },
      );
    } else {
      map.flyTo({ ...WORLD_VIEW, ...motion });
    }
  }, [focusId, focusInclude, travelMs]);

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
      attributionControl={{ compact: true }}
      // Start with the credits folded into the (i) button; MapLibre opens them on load.
      onLoad={(e) =>
        e.target
          .getContainer()
          .querySelector(".maplibregl-ctrl-attrib")
          ?.classList.remove("maplibregl-compact-show")
      }
      onClick={(e) => {
        const { lng, lat } = e.lngLat.wrap();
        onPick?.([lng, lat]);
      }}
    >
      <Layer
        id="highlight"
        type="fill"
        source="countries"
        beforeId="ice"
        filter={["==", ["get", "id"], focusId ?? ""]}
        paint={{ "fill-color": ACCENT, "fill-opacity": 0.35 }}
      />
      <Layer
        id="highlight-glow"
        type="line"
        source="countries"
        filter={["==", ["get", "id"], focusId ?? ""]}
        paint={{ "line-color": ACCENT, "line-width": 8, "line-blur": 6, "line-opacity": 0.6 }}
      />
      <Layer
        id="highlight-outline"
        type="line"
        source="countries"
        filter={["==", ["get", "id"], focusId ?? ""]}
        paint={{ "line-color": "#b8700a", "line-width": 2 }}
      />
      {line && (
        <Source id="guess-line" type="geojson" data={line}>
          <Layer
            id="guess-line"
            type="line"
            paint={{ "line-color": "#14283a", "line-width": 2, "line-dasharray": [1.5, 1.5] }}
          />
        </Source>
      )}
      {pin && (
        <Marker longitude={pin[0]} latitude={pin[1]} anchor="bottom">
          <svg
            width="28"
            height="36"
            viewBox="0 0 26 34"
            aria-label="Your pin"
            role="img"
            className="motion-safe:animate-pin-drop drop-shadow-md"
          >
            <path d="M13 33 3 18a11 11 0 1 1 20 0z" fill="#d1495b" stroke="#fff" strokeWidth="2" />
            <circle cx="13" cy="12" r="4" fill="#fff" />
          </svg>
        </Marker>
      )}
      {answer && (
        <Marker longitude={answer[0]} latitude={answer[1]} anchor="center">
          <span className="relative flex size-8 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-white/70 motion-safe:animate-ping" />
            <svg
              viewBox="0 0 24 24"
              className="relative size-6 drop-shadow"
              aria-label="Capital"
              role="img"
            >
              <path
                d="M12 2.5l2.8 6.1 6.7.7-5 4.5 1.4 6.6L12 17l-5.9 3.4 1.4-6.6-5-4.5 6.7-.7z"
                fill="#fff"
                stroke="#14283a"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Marker>
      )}
    </MapLibre>
  );
}
