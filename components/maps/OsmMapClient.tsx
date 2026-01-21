"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useMemo } from "react";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number;
  placeLabel?: string | null;
};

export default function OsmMapClient({ lat, lng, zoom = 14, height = 320, placeLabel }: Props) {
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        <Marker position={center} icon={markerIcon}>
          {placeLabel ? (
            <Popup>
              <div className="text-sm">{placeLabel}</div>
            </Popup>
          ) : null}
        </Marker>
      </MapContainer>
    </div>
  );
}
