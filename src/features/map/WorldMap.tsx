import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapLibre } from "react-map-gl/maplibre";
import { mapStyle } from "./mapStyle";

export function WorldMap() {
  return (
    <MapLibre
      initialViewState={{ longitude: 10, latitude: 25, zoom: 1.4 }}
      mapStyle={mapStyle}
      style={{ position: "absolute", inset: 0 }}
      dragRotate={false}
      attributionControl={false}
    />
  );
}
