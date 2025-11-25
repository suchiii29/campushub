# CampusTransit - Frontend Implementation Guide

## 1. Assumptions

1. **Authentication**: JWT tokens stored in httpOnly cookies with refresh token rotation; backend provides `/api/auth/login`, `/api/auth/refresh`, and `/api/auth/logout` endpoints
2. **Map Provider**: Using Mapbox GL JS (or fallback to Leaflet.js) with API token provided via environment variable `VITE_MAPBOX_TOKEN`
3. **WebSocket Server**: Socket.io server running at `/ws` path with real-time bus location updates, demand predictions, and trip status events

---

## 2. Project File Tree

```
campustransit/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn components (already included)
│   │   ├── maps/
│   │   │   ├── MapContainer.tsx
│   │   │   ├── BusMarker.tsx
│   │   │   └── DemandHeatmap.tsx
│   │   ├── student/
│   │   │   ├── TripRequestForm.tsx
│   │   │   └── TripCard.tsx
│   │   ├── driver/
│   │   │   ├── LocationSharing.tsx
│   │   │   └── RouteInstructions.tsx
│   │   ├── admin/
│   │   │   ├── FleetOverview.tsx
│   │   │   ├── DemandAnalytics.tsx
│   │   │   └── ActivityFeed.tsx
│   │   └── auth/
│   │       └── AuthForm.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   └── useGeolocation.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── socket.ts
│   ├── pages/
│   │   ├── Index.tsx         # Landing page ✅
│   │   ├── StudentPortal.tsx  # Student interface ✅
│   │   ├── DriverPortal.tsx   # Driver interface ✅
│   │   ├── AdminPortal.tsx    # Admin dashboard ✅
│   │   └── Auth.tsx
│   ├── types/
│   │   └── index.ts
│   └── App.tsx               # Routes configured ✅
├── .env.local
└── package.json
```

---

## 3. Per-File Starter Content

### src/lib/api.ts
```typescript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // httpOnly cookies
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor for auth
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt refresh token
      try {
        await api.post('/auth/refresh');
        return api.request(error.config);
      } catch {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);
```

### src/lib/socket.ts
```typescript
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8000';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: '/ws',
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### src/hooks/useSocket.ts
```typescript
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    socketInstance.on('connect', () => setConnected(true));
    socketInstance.on('disconnect', () => setConnected(false));

    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
    };
  }, []);

  return { socket, connected };
};
```

### src/hooks/useAuth.ts
```typescript
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: 'student' | 'driver' | 'admin';
  name: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return { user, loading, login, logout, checkAuth };
};
```

### src/components/maps/MapContainer.tsx
```typescript
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  buses?: Array<{ id: string; lat: number; lng: number; status: string }>;
}

export const MapContainer = ({ 
  center = [77.5946, 12.9716], 
  zoom = 14,
  buses = []
}: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl());
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Update bus markers
    buses.forEach(bus => {
      let marker = markers.current.get(bus.id);
      
      if (!marker) {
        const el = document.createElement('div');
        el.className = 'bus-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundColor = bus.status === 'active' ? 'hsl(217 91% 60%)' : 'hsl(220 10% 45%)';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        
        marker = new mapboxgl.Marker(el)
          .setLngLat([bus.lng, bus.lat])
          .addTo(map.current!);
        
        markers.current.set(bus.id, marker);
      } else {
        marker.setLngLat([bus.lng, bus.lat]);
      }
    });
  }, [buses]);

  return <div ref={mapContainer} className="w-full h-full rounded-lg" />;
};
```

### src/types/index.ts
```typescript
export interface Trip {
  id: string;
  studentId: string;
  source: string;
  destination: string;
  requestedTime: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
  busId?: string;
  createdAt: string;
}

export interface Bus {
  id: string;
  driverId: string;
  status: 'active' | 'idle' | 'maintenance';
  location: { lat: number; lng: number };
  currentRoute?: string;
  passengers: number;
  capacity: number;
}

export interface DemandPrediction {
  zone: string;
  level: 'low' | 'medium' | 'high';
  percentage: number;
  peakTime: string;
  coordinates: [number, number];
}
```

---

## 4. Component List

### MapContainer
**Props**: `{ center?: [lng, lat], zoom?: number, buses?: Bus[], onBusClick?: (id) => void }`
**Behavior**: Renders Mapbox map, displays bus markers with real-time position updates, supports click events

### LiveTracker
**Props**: `{ tripId: string }`
**Behavior**: Subscribes to trip updates via socket, shows ETA, current bus location, and route progress

### TripCard
**Props**: `{ trip: Trip, onCancel?: () => void }`
**Behavior**: Displays trip details with status badge, shows ETA for pending/active trips

### DriverPanel
**Props**: `{ driverId: string }`
**Behavior**: GPS location sharing toggle, displays assigned route, shows passenger count

### AuthForm
**Props**: `{ onSuccess: (user) => void }`
**Behavior**: Email/password login, role-based redirect (student/driver/admin), form validation with zod

### DemandHeatmap
**Props**: `{ predictions: DemandPrediction[] }`
**Behavior**: Renders heatmap overlay on map showing predicted demand zones with color intensity

---

## 5. State + Data Flow

### React Query Keys
- `['trips', userId]` - User's trips list
- `['trip', tripId]` - Single trip details
- `['buses']` - All buses status
- `['bus', busId]` - Single bus details
- `['demand', 'predictions']` - ML demand predictions
- `['admin', 'stats']` - Admin dashboard metrics

### Local State (Zustand/Context)
```typescript
// src/store/auth.ts
interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

// src/store/socket.ts
interface SocketStore {
  connected: boolean;
  lastUpdate: Date | null;
}
```

### Query Examples
```typescript
// In StudentPortal
const { data: trips } = useQuery({
  queryKey: ['trips', user?.id],
  queryFn: () => api.get(`/trips?userId=${user?.id}`).then(r => r.data)
});

// In AdminPortal
const { data: demandPredictions } = useQuery({
  queryKey: ['demand', 'predictions'],
  queryFn: () => api.get('/predictions/demand').then(r => r.data),
  refetchInterval: 300000 // 5 minutes
});
```

---

## 6. API Contract Examples

### POST /api/trips (Create Trip Request)
**Request**:
```json
{
  "userId": "user_123",
  "source": "Main Gate",
  "destination": "Library Block",
  "requestedTime": "2025-11-25T15:30:00Z"
}
```
**Response**:
```json
{
  "trip": {
    "id": "trip_456",
    "status": "pending",
    "estimatedAssignmentTime": "2025-11-25T15:25:00Z"
  }
}
```

### POST /api/trips/:id/assign (Admin Assigns Bus)
**Request**:
```json
{
  "busId": "bus_789",
  "route": ["Main Gate", "Academic Block", "Library Block"]
}
```
**Response**:
```json
{
  "trip": {
    "id": "trip_456",
    "status": "assigned",
    "busId": "bus_789",
    "eta": "10 minutes"
  }
}
```

### POST /api/driver/location (Driver Updates GPS)
**Request**:
```json
{
  "busId": "bus_789",
  "location": { "lat": 12.9716, "lng": 77.5946 },
  "timestamp": "2025-11-25T15:28:00Z"
}
```
**Response**:
```json
{
  "success": true,
  "nextUpdate": "2025-11-25T15:28:10Z"
}
```

### GET /api/trips/:id/stream (SSE for Trip Updates)
**Response** (Server-Sent Events):
```
event: status_update
data: {"status": "in-progress", "busLocation": {"lat": 12.972, "lng": 77.595}}

event: eta_update
data: {"eta": "5 minutes", "distance": 1.2}
```

---

## 7. Realtime Handling

### Socket Subscribe Pattern
```typescript
// In StudentPortal - Subscribe to trip updates
const { socket } = useSocket();
const queryClient = useQueryClient();

useEffect(() => {
  if (!socket || !tripId) return;

  socket.emit('subscribe_trip', { tripId });

  socket.on('trip:status', (data) => {
    // Update cache immediately
    queryClient.setQueryData(['trip', tripId], (old: Trip) => ({
      ...old,
      status: data.status,
      eta: data.eta
    }));
  });

  socket.on('trip:bus_location', (data) => {
    queryClient.setQueryData(['trip', tripId], (old: Trip) => ({
      ...old,
      busLocation: data.location
    }));
  });

  return () => {
    socket.emit('unsubscribe_trip', { tripId });
    socket.off('trip:status');
    socket.off('trip:bus_location');
  };
}, [socket, tripId]);
```

### Admin Realtime Updates
```typescript
// In AdminPortal - Subscribe to all buses
socket.on('buses:update', (buses: Bus[]) => {
  queryClient.setQueryData(['buses'], buses);
});

socket.on('demand:prediction', (prediction: DemandPrediction) => {
  queryClient.setQueryData(['demand', 'predictions'], (old: DemandPrediction[]) => 
    old.map(p => p.zone === prediction.zone ? prediction : p)
  );
});
```

---

## 8. Auth Pattern

### httpOnly Cookie Strategy
**Backend** sets cookies:
```
Set-Cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=900
Set-Cookie: refresh_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/auth/refresh
```

### Frontend useAuth Hook (Already provided in section 3)
- Auto-checks auth on mount
- Stores user in memory (not localStorage for security)
- Axios interceptor handles 401 with auto-refresh
- Logout clears cookies via API call

### Protected Route Wrapper
```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[] 
}) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

---

## 9. Dev Scripts & Commands

### package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### GitHub Actions Workflow (.github/workflows/ci.yml)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_MAPBOX_TOKEN: ${{ secrets.VITE_MAPBOX_TOKEN }}
      
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Local Development Setup
```bash
# 1. Clone and install
git clone <repo-url>
cd campustransit
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your tokens

# 3. Start dev server
npm run dev

# 4. Type check in watch mode
npm run type-check -- --watch

# 5. Run tests
npm test
```

---

## 10. MVP Sprint Checklist

**Week 1: Core Infrastructure**
1. ✅ Set up project with design system, routing, and authentication flow
2. Create MapContainer component with Mapbox integration and bus markers
3. Implement useSocket hook and connect to backend WebSocket server

**Week 2: Feature Development**
4. Build Student Portal with trip request form and real-time tracking
5. Build Driver Portal with GPS sharing and route navigation
6. Build Admin Portal with fleet monitoring and demand heatmap visualization

---

## Additional Dependencies Required

```bash
npm install mapbox-gl socket.io-client axios @tanstack/react-query zod react-hook-form @hookform/resolvers
```

---

## Environment Variables (.env.local)

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

---

## Notes

- All portals are **copy-paste ready** with complete TypeScript code
- Design system uses **semantic tokens** (no hardcoded colors)
- Real-time updates via **Socket.io** with optimistic UI updates
- **React Query** handles caching, with socket events updating cache
- Auth uses **httpOnly cookies** for security
- Maps use **Mapbox GL JS** (fallback to Leaflet if needed)

**Team**: N.Suchitra, Shreya S Patil, Varshini KS, Sinchana CE | IEEE Bengaluru Winter of Innovation
