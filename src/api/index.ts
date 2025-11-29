// src/api/index.ts - COMPLETE API FILE

import { auth } from "@/lib/firebase";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// ============================================
// HELPER: Get Firebase Token
// ============================================
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

// ============================================
// TEST ENDPOINTS
// ============================================
export async function testConnection(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/test/`);
  if (!response.ok) throw new Error("Connection failed");
  return response.json();
}

export async function callProtectedTest(): Promise<any> {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/protected-test/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Protected endpoint failed");
  return response.json();
}

// ============================================
// STUDENT ENDPOINTS
// ============================================

interface StudentRegisterData {
  student_id: string;
  phone: string;
  address: string;
}

export async function registerStudent(data: StudentRegisterData): Promise<any> {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/student/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  return response.json();
}

interface BookingData {
  source: string;
  destination: string;
  pickup_time: string; // ISO datetime
}

export async function createBooking(data: BookingData): Promise<any> {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  console.log("Creating booking:", data);

  const response = await fetch(`${API_BASE_URL}/student/booking/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Booking error:", error);
    throw new Error(error.error || "Booking failed");
  }

  return response.json();
}

export async function getStudentBookings(): Promise<any> {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/student/bookings/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch bookings");
  return response.json();
}

// ============================================
// DRIVER ENDPOINTS
// ============================================

export async function postDriverLocation(
  driverId: string,
  lat: number,
  lng: number,
  speed: number = 0
): Promise<any> {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/driver/location/update/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ lat, lng, speed }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update location");
  }

  return response.json();
}

export async function sendDriverLocation(
  driverId: string,
  lat: number,
  lng: number
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/driver/location/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ driverId, lat, lng }),
  });

  if (!response.ok) throw new Error("Failed to send location");
  return response.json();
}

export async function testProtectedEndpoint(): Promise<any> {
  return callProtectedTest();
}

// ============================================
// ADMIN ENDPOINTS
// ============================================

export async function getAllBusLocations(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/buses/locations/`);
  if (!response.ok) throw new Error("Failed to fetch bus locations");
  return response.json();
}

export async function getPendingBookings(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/bookings/pending/`);
  if (!response.ok) throw new Error("Failed to fetch pending bookings");
  return response.json();
}
