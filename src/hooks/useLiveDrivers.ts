// src/hooks/useLiveDrivers.ts
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type DriverDoc = {
  driverId: string;
  displayName?: string;
  email?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  isActive?: boolean;
  updatedAt?: any;
};

export function useLiveDrivers() {
  const [drivers, setDrivers] = useState<DriverDoc[]>([]);
  useEffect(() => {
    const q = query(collection(db, "driver_locations"), where("isActive", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...(d.data() as any) }));
      setDrivers(list);
    }, (err) => {
      console.error("Firestore drivers snapshot error:", err);
    });
    return () => unsub();
  }, []);
  return drivers;
}
