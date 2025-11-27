// src/pages/DriverPortal.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Users, Clock, TrendingUp, LogOut, User, Menu, X, Bus, Activity, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, Timestamp } from "firebase/firestore";

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

  // Redirect if not authenticated or not a driver
  useEffect(() => {
    if (!currentUser) {
      navigate("/driver/auth");
    } else if (userRole !== "driver") {
      toast.error("Access denied. Drivers only.");
      navigate("/");
    }
  }, [currentUser, userRole, navigate]);

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
      setRecentRequests(requests.slice(0, 5)); // Show top 5
    });

    return () => unsubscribe();
  }, []);

  // GPS Location Tracking
  useEffect(() => {
    if (isSharing && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(newLocation);
          
          // Update location in Firestore
          if (currentUser) {
            updateDoc(doc(db, "drivers", currentUser.uid), {
              currentLocation: newLocation,
              lastUpdated: Timestamp.now()
            }).catch(err => console.error("Error updating location:", err));
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Failed to get location");
          setIsSharing(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isSharing, currentUser]);

  const toggleLocationSharing = () => {
    if (!isSharing) {
      setIsSharing(true);
      toast.success("Location sharing started");
    } else {
      setIsSharing(false);
      toast.info("Location sharing stopped");
    }
  };

  const handleStartTrip = async () => {
    if (!currentRoute) return;
    
    try {
      await updateDoc(doc(db, "routes", currentRoute.id), {
        status: "in_progress",
        startedAt: Timestamp.now()
      });
      toast.success("Trip started!");
    } catch (error) {
      toast.error("Failed to start trip");
    }
  };

  const handleCompleteTrip = async () => {
    if (!currentRoute) return;
    
    try {
      await updateDoc(doc(db, "routes", currentRoute.id), {
        status: "completed",
        completedAt: Timestamp.now()
      });
      
      // Update stats
      setTodayStats(prev => ({
        totalTrips: prev.totalTrips + 1,
        totalPassengers: prev.totalPassengers + (currentRoute.passengers || 0),
        hoursWorked: prev.hoursWorked + 0.5
      }));
      
      toast.success("Trip completed successfully!");
    } catch (error) {
      toast.error("Failed to complete trip");
    }
  };

  const handleLogout = async () => {
    try {
      if (isSharing) {
        setIsSharing(false);
      }
      await logout();
      toast.success("Logged out successfully");
      navigate("/driver/auth");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const driverName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Driver';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-2 rounded-lg">
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CampusTransit</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Driver Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{driverName}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
              
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-2 rounded-full">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {driverName}! 🚌
          </h2>
          <p className="text-gray-600">Manage your routes and track your trips</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* GPS Status Card */}
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

          {/* Current Route */}
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

          {/* Today's Stats */}
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

        {/* Recent Student Requests */}
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
                {recentRequests.map((request) => (
                  <div key={request.id} className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50 hover:border-orange-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{request.source} → {request.destination}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(request.date).toLocaleDateString()} at {request.time}
                        </p>
                      </div>
                      <Badge className="bg-orange-500">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No pending requests nearby</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map View */}
        <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <MapPin className="h-6 w-6 text-orange-500" />
              Navigation Map
            </CardTitle>
            <CardDescription>Real-time navigation and route guidance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
              <Navigation className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">Interactive Map Coming Soon</p>
              <p className="text-sm text-gray-500 mt-2">GPS-guided navigation with turn-by-turn directions</p>
              {isSharing && currentLocation && (
                <div className="mt-4 text-xs text-gray-600 bg-white px-4 py-2 rounded-lg">
                  Currently at: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
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