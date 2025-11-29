// src/components/StudentLiveMap.tsx
import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { useLiveDrivers } from "../hooks/useLiveDrivers";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function StudentLiveMap() {
  const drivers = useLiveDrivers();

  const center = useMemo(() => {
    if (drivers.length > 0) return [drivers[0].latitude, drivers[0].longitude];
    return [12.9716, 77.5946];
  }, [drivers]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <MapContainer center={center as any} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <ZoomControl position="topright" />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
        {drivers.map((d) => (
          <Marker key={d.driverId} position={[d.latitude, d.longitude]} icon={busIcon}>
            <Popup>
              <div>
                <b>{d.displayName ?? d.email}</b><br />
                Speed: {d.speed?.toFixed?.(1) ?? "—"} km/h<br />
                Updated: {d.updatedAt?.toDate ? d.updatedAt.toDate().toLocaleTimeString() : "-"}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
