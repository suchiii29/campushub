// src/pages/DriverPortal.tsx - COMPLETE WITH REAL-TIME LOCATION SHARING + REAL MAP
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Users, Clock, TrendingUp, LogOut, User, Menu, X, Bus, Activity, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, Timestamp, setDoc } from "firebase/firestore";
import { postDriverLocation, callProtectedTest } from "../api/index";

// ⭐ NEW IMPORT FOR MAP
import LiveDriverMap from "../components/LiveDriverMap";

interface RouteAssignment {
  id: string;
  driverId: string;
  source: string;
  destination: string;
  passengers: number;
  status: "assigned" | "in_progress" | "completed";
  assignedAt: Timestamp;
}

interface TripStats {
  totalTrips: number;
  totalPassengers: number;
  hoursWorked: number;
}

const POLL_INTERVAL_MS = 7000;

const DriverPortal = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RouteAssignment | null>(null);
  const [todayStats, setTodayStats] = useState<TripStats>({
    totalTrips: 0,
    totalPassengers: 0,
    hoursWorked: 0
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const lastPosRef = useRef<{ lat: number; lng: number; speed: number } | null>(null);
  const intervalRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // NEW: keep a list of active drivers (so student view and map can show them)
  const [drivers, setDrivers] = useState<any[]>([]);

  // Redirect if not authenticated or wrong role
  useEffect(() => {
    if (!currentUser) {
      navigate("/driver/auth");
    } else if (userRole !== "driver") {
      toast.error("Access denied. Drivers only.");
      navigate("/");
    }
  }, [currentUser, userRole, navigate]);

  // Listen to all active drivers for the live map (keeps drivers[] up to date)
  useEffect(() => {
    const q = query(collection(db, "driver_locations"), where("isActive", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => {
        const data = d.data();
        // normalize coordinates if needed (keep original fields too)
        return {
          id: d.id,
          latitude: Number(data.latitude ?? data.lat ?? data.latitude),
          longitude: Number(data.longitude ?? data.lng ?? data.longitude),
          displayName: data.displayName,
          speed: data.speed,
          ...data
        };
      });
      setDrivers(list);
    }, (err) => {
      console.error("driver_locations listener error:", err);
    });

    return () => unsub();
  }, []);

  // Listen to assigned routes
  useEffect(() => {
    if (!currentUser) return;

    const routesQuery = query(
      collection(db, "routes"),
      where("driverId", "==", currentUser.uid),
      where("status", "in", ["assigned", "in_progress"])
    );

    const unsubscribe = onSnapshot(routesQuery, (snapshot) => {
      if (!snapshot.empty) {
        const routeData = snapshot.docs[0].data() as RouteAssignment;
        setCurrentRoute({ id: snapshot.docs[0].id, ...routeData });
      } else {
        setCurrentRoute(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Listen to nearby student requests
  useEffect(() => {
    const requestsQuery = query(
      collection(db, "requests"),
      where("status", "==", "Pending")
    );

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentRequests(requests.slice(0, 5));
    });

    return () => unsubscribe();
  }, []);

  // Real-time GPS
  useEffect(() => {
    if (isSharing && "geolocation" in navigator && currentUser) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            speed: position.coords.speed || 0
          };
          setCurrentLocation(newLocation);
          lastPosRef.current = newLocation;
        },
        (err) => {
          console.error(err);
          toast.error("Failed to get location");
          setIsSharing(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      watchIdRef.current = id;

      intervalRef.current = window.setInterval(async () => {
        const pos = lastPosRef.current;
        if (!pos) return;

        try {
          await postDriverLocation(currentUser.uid, pos.lat, pos.lng, pos.speed);

          await setDoc(doc(db, "driver_locations", currentUser.uid), {
            driverId: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email,
            latitude: pos.lat,
            longitude: pos.lng,
            speed: pos.speed,
            timestamp: Timestamp.now(),
            isActive: true,
            lastUpdated: new Date().toISOString()
          }, { merge: true });

        } catch (e) {
          console.error("Backend failed, fallback:", e);

          try {
            await updateDoc(doc(db, "driver_locations", currentUser.uid), {
              latitude: pos.lat,
              longitude: pos.lng,
              speed: pos.speed,
              timestamp: Timestamp.now(),
              isActive: true
            });
          } catch (err) {
            console.error("Firestore also failed:", err);
          }
        }
      }, POLL_INTERVAL_MS);

      return () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isSharing, currentUser]);

  // Cleanup when unmounted
  useEffect(() => {
    return () => {
      if (currentUser && isSharing) {
        updateDoc(doc(db, "driver_locations", currentUser.uid), {
          isActive: false,
          lastSeen: Timestamp.now()
        }).catch(console.error);
      }
    };
  }, [currentUser, isSharing]);

  const toggleLocationSharing = () => {
    setIsSharing(prev => !prev);
    toast.success(!isSharing ? "Location sharing started" : "Location sharing stopped");
  };

  const handleStartTrip = async () => {
    if (!currentRoute) return;
    await updateDoc(doc(db, "routes", currentRoute.id), {
      status: "in_progress",
      startedAt: Timestamp.now()
    });
    toast.success("Trip started!");
  };

  const handleCompleteTrip = async () => {
    if (!currentRoute) return;

    await updateDoc(doc(db, "routes", currentRoute.id), {
      status: "completed",
      completedAt: Timestamp.now()
    });

    setTodayStats(prev => ({
      totalTrips: prev.totalTrips + 1,
      totalPassengers: prev.totalPassengers + (currentRoute.passengers || 0),
      hoursWorked: prev.hoursWorked + 0.5
    }));

    toast.success("Trip completed!");
  };

  const handleLogout = async () => {
    try {
      if (isSharing) setIsSharing(false);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);

      await logout();
      navigate("/driver/auth");
    } catch {
      toast.error("Logout failed");
    }
  };

  async function handleTestBackend() {
    try {
      await callProtectedTest();
      toast.success("Backend test OK");
    } catch (e) {
      toast.error("Backend test failed");
    }
  }

  const driverName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Driver";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50">
      
      {/* HEADER — unchanged */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-2 rounded-lg">
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CampusTransit</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Driver Portal</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{driverName}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
              </div>

              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-2 rounded-full">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{driverName}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT — all unchanged except map at bottom */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {driverName}! 🚌
        </h2>
        <p className="text-gray-600 mb-6">Manage your routes and track your trips</p>

        {/* CARDS — unchanged */}
        {/* GPS STATUS / CURRENT ROUTE / TODAY STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* GPS CARD */}
          <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                GPS Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={isSharing ? "default" : "secondary"} className={isSharing ? "bg-green-500" : ""}>
                    {isSharing ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <Button
                  onClick={toggleLocationSharing}
                  className={`w-full ${isSharing ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'}`}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  {isSharing ? "Stop Sharing" : "Start Sharing"}
                </Button>

                <Button onClick={handleTestBackend} size="sm" variant="outline">Test Backend</Button>

                {currentLocation && (
                  <div className="text-xs text-gray-500 pt-2 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Current Location:</p>
                    <p>Lat: {currentLocation.lat.toFixed(6)}</p>
                    <p>Lng: {currentLocation.lng.toFixed(6)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CURRENT ROUTE CARD */}
          <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                Current Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentRoute ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-500 mt-1" />
                    <div>
                      <p className="font-medium text-sm">{currentRoute.source}</p>
                      <p className="text-xs text-gray-500">Pickup point</p>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-orange-300 ml-2 h-8"></div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-500 mt-1" />
                    <div>
                      <p className="font-medium text-sm">{currentRoute.destination}</p>
                      <p className="text-xs text-gray-500">Destination</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-gray-600 mb-2">
                      <Users className="h-3 w-3 inline mr-1" />
                      {currentRoute.passengers || 0} passengers
                    </p>

                    {currentRoute.status === "assigned" && (
                      <Button onClick={handleStartTrip} className="w-full bg-green-500 hover:bg-green-600" size="sm">
                        Start Trip
                      </Button>
                    )}
                    {currentRoute.status === "in_progress" && (
                      <Button onClick={handleCompleteTrip} className="w-full bg-blue-500 hover:bg-blue-600" size="sm">
                        Complete Trip
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bus className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No active route assigned</p>
                  <p className="text-xs mt-1">Wait for admin assignment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* TODAY STATS */}
          <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                Today's Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Passengers</span>
                </div>
                <span className="font-bold text-lg">{todayStats.totalPassengers}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Trips</span>
                </div>
                <span className="font-bold text-lg">{todayStats.totalTrips}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Hours</span>
                </div>
                <span className="font-bold text-lg">{todayStats.hoursWorked.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* STUDENT REQUESTS */}
        <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              Nearby Student Requests
            </CardTitle>
            <CardDescription>Real-time requests from students</CardDescription>
          </CardHeader>

          <CardContent>
            {recentRequests.length > 0 ? (
              <div className="space-y-3">
                {recentRequests.map((req) => (
                  <div key={req.id} className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50 hover:border-orange-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{req.source} → {req.destination}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(req.date).toLocaleDateString()} at {req.time}
                        </p>
                      </div>
                      <Badge className="bg-orange-500">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No pending requests</div>
            )}
          </CardContent>
        </Card>

        {/* ⭐⭐⭐ MAP SECTION — UPDATED ⭐⭐⭐ */}
        <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <MapPin className="h-6 w-6 text-orange-500" />
              Navigation Map
            </CardTitle>
            <CardDescription>Real-time navigation and route guidance</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-96 rounded-lg overflow-hidden">
              {currentLocation ? (
                <LiveDriverMap currentLocation={currentLocation} driverName={driverName} drivers={drivers} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-orange-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <Navigation className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-700 font-medium">Waiting for GPS...</p>
                  <p className="text-sm text-gray-500">Start sharing to load map</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default DriverPortal;
