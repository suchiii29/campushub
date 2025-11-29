// src/types/index.ts

export interface Trip {
  id: string;
  studentId: string;
  source: string;
  destination: string;
  requestedTime: string;
  status: "pending" | "assigned" | "in-progress" | "completed";
  busId?: string;
  createdAt: string;
  eta?: string;
  busLocation?: {
    lat: number;
    lng: number;
  };
}

export interface Bus {
  id: string;
  driverId: string;
  driverName?: string;
  status: "active" | "idle" | "maintenance";
  location: {
    lat: number;
    lng: number;
  };
  currentRoute?: string;
  passengers: number;
  capacity: number;
  lastUpdated?: string;
}

export interface DemandPrediction {
  zone: string;
  level: "low" | "medium" | "high";
  percentage: number;
  peakTime: string;
  coordinates: [number, number];
}

export interface User {
  id: string;
  email: string;
  role: "student" | "driver" | "admin";
  name: string;
}

export interface Route {
  id: string;
  name: string;
  stops: string[];
  distance: number; // in km
  estimatedDuration: number; // in minutes
}

export interface AdminStats {
  activeBuses: number;
  totalBuses: number;
  studentsServed: number;
  avgWaitTime: number;
  efficiency: number; // percentage
}
