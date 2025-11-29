// src/api.ts
import axios from "axios";
import { auth } from "./lib/firebase"; // Make sure this path is correct

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Helper function to get Firebase ID token
async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not logged in");
  }
  // Force refresh to get fresh token
  return await user.getIdToken(true);
}

// ============================================
// PUBLIC ENDPOINTS (No Authentication)
// ============================================

export async function testConnection() {
  try {
    const res = await axios.get(`${API_BASE}/test/`);
    return res.data;
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    throw error;
  }
}

export async function sendDriverLocation(
  driverId: string,
  lat: number,
  lng: number
) {
  try {
    const res = await axios.post(`${API_BASE}/driver/location/`, {
      driverId,
      lat,
      lng,
    });
    return res.data;
  } catch (error) {
    console.error("❌ Failed to send location:", error);
    throw error;
  }
}

// ============================================
// PROTECTED ENDPOINTS (Requires Authentication)
// ============================================

export async function testProtectedEndpoint() {
  try {
    const token = await getIdToken();
    const res = await axios.get(`${API_BASE}/protected-test/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Protected test failed:", error);
    throw error;
  }
}

export async function registerStudent(
  studentId: string,
  phone: string,
  address: string
) {
  try {
    const token = await getIdToken();
    const res = await axios.post(
      `${API_BASE}/student/register/`,
      {
        student_id: studentId,
        phone: phone,
        address: address,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Failed to register student:", error);
    throw error;
  }
}

export async function updateDriverLocation(lat: number, lng: number, speed: number = 0) {
  try {
    const token = await getIdToken();
    const res = await axios.post(
      `${API_BASE}/driver/location/update/`,
      {
        lat,
        lng,
        speed,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Failed to update driver location:", error);
    throw error;
  }
}