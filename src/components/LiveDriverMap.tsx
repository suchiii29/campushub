// src/components/LiveDriverMap.tsx
import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";

type Location = { lat: number; lng: number };

interface LiveDriverMapProps {
  currentLocation?: Location | null;
  driverName?: string;
  drivers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    displayName?: string;
    speed?: number;
  }>;
}

function AutoCenter({ position, zoom }: { position: Location | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    try {
      map.flyTo([position.lat, position.lng], zoom, { duration: 0.8 });
    } catch {
      map.setView([position.lat, position.lng], zoom);
    }
  }, [position?.lat, position?.lng, zoom, map]);
  return null;
}

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const pinIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

export default function LiveDriverMap({ currentLocation = null, driverName = "Driver", drivers }: LiveDriverMapProps) {
  const defaultCenter = useMemo(() => {
    if (currentLocation) return currentLocation;
    if (drivers && drivers.length > 0) return { lat: drivers[0].latitude, lng: drivers[0].longitude };
    return { lat: 12.9716, lng: 77.5946 };
  }, [currentLocation, drivers]);

  const initialZoom = currentLocation ? 15 : 13;
  const zoom = currentLocation ? 15 : 13;

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-30 bg-white p-3 rounded-lg shadow-lg text-xs">
        <div className="font-semibold mb-2">Live Tracking</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" /> <span>Active ({drivers?.length ?? (currentLocation ? 1 : 0)})</span>
        </div>
      </div>

      <MapContainer center={[defaultCenter.lat, defaultCenter.lng]} zoom={initialZoom} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <ZoomControl position="topright" />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />

        <AutoCenter position={currentLocation ? currentLocation : null} zoom={zoom} />

        {drivers && drivers.length > 0 && drivers.map((d) => (
          <Marker key={d.id} position={[d.latitude, d.longitude]} icon={busIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{d.displayName ?? `Driver ${d.id}`}</strong>
                <div className="text-xs">Lat: {d.latitude.toFixed(5)}</div>
                <div className="text-xs">Lng: {d.longitude.toFixed(5)}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={busIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{driverName}</strong>
                <div className="text-xs">Lat: {currentLocation.lat.toFixed(5)}</div>
                <div className="text-xs">Lng: {currentLocation.lng.toFixed(5)}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {!currentLocation && (!drivers || drivers.length === 0) && (
          <Marker position={[defaultCenter.lat, defaultCenter.lng]} icon={pinIcon}>
            <Popup>
              <div className="text-sm">Campus Center</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
