import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Bus } from '@/types';

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  buses?: Bus[];
  onBusClick?: (busId: string) => void;
}

export const MapContainer = ({ 
  center = [77.5946, 12.9716], 
  zoom = 14,
  buses = [],
  onBusClick
}: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.warn('VITE_MAPBOX_TOKEN not set. Map will not render.');
      return;
    }

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear old markers not in current buses list
    const currentBusIds = new Set(buses.map(b => b.id));
    markers.current.forEach((marker, busId) => {
      if (!currentBusIds.has(busId)) {
        marker.remove();
        markers.current.delete(busId);
      }
    });

    // Update bus markers
    buses.forEach(bus => {
      let marker = markers.current.get(bus.id);
      
      if (!marker) {
        const el = document.createElement('div');
        el.className = 'bus-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundColor = bus.status === 'active' 
          ? 'hsl(217 91% 60%)' 
          : 'hsl(220 10% 45%)';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '12px';
        el.style.color = 'white';
        el.textContent = bus.id.replace('bus_', '');
        
        if (onBusClick) {
          el.addEventListener('click', () => onBusClick(bus.id));
        }
        
        marker = new mapboxgl.Marker(el)
          .setLngLat([bus.location.lng, bus.location.lat])
          .addTo(map.current!);
        
        markers.current.set(bus.id, marker);
      } else {
        // Update existing marker position and style
        marker.setLngLat([bus.location.lng, bus.location.lat]);
        const el = marker.getElement();
        el.style.backgroundColor = bus.status === 'active' 
          ? 'hsl(217 91% 60%)' 
          : 'hsl(220 10% 45%)';
      }
    });
  }, [buses, onBusClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {!import.meta.env.VITE_MAPBOX_TOKEN && (
        <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground text-center px-4">
            Map not available. Set VITE_MAPBOX_TOKEN in .env.local
          </p>
        </div>
      )}
    </div>
  );
};
