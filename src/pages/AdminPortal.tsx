// src/pages/AdminPortal.tsx - COMPLETE WITH REAL-TIME FLEET MONITORING
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bus, Users, TrendingUp, Activity, MapPin, Clock, LogOut, User, Menu, X, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, where, Timestamp } from "firebase/firestore";

interface BusData {
  id: string;
  busNumber: number;
  status: "active" | "idle";
  currentLocation?: string;
  passengers: number;
  trips: number;
}

interface RequestData {
  id: string;
  userId: string;
  source: string;
  destination: string;
  status: string;
  createdAt: Timestamp;
}

const AdminPortal = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeBuses, setActiveBuses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgWaitTime, setAvgWaitTime] = useState("4.2m");
  const [efficiency, setEfficiency] = useState(87);
  const [recentRequests, setRecentRequests] = useState<RequestData[]>([]);
  const [busesData, setBusesData] = useState<BusData[]>([]);
  const [driverLocations, setDriverLocations] = useState<any[]>([]);

  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/admin/auth");
    } else if (userRole !== "admin") {
      toast.error("Access denied. Admins only.");
      navigate("/");
    }
  }, [currentUser, userRole, navigate]);

  // Listen to student requests
  useEffect(() => {
    const requestsQuery = query(collection(db, "requests"));
    
    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RequestData[];
      
      setRecentRequests(requests.slice(0, 10));
      setTotalStudents(requests.length);
    });

    return () => unsubscribe();
  }, []);

  // ✨ NEW: Listen to all active driver locations
  useEffect(() => {
    const driversQuery = query(
      collection(db, "driver_locations"),
      where("isActive", "==", true)
    );

    const unsubscribe = onSnapshot(driversQuery, (snapshot) => {
      const locations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDriverLocations(locations);
      console.log(`👁️ Admin monitoring ${locations.length} active driver(s)`);
    }, (error) => {
      console.error("Error listening to driver locations:", error);
    });

    return () => unsubscribe();
  }, []);

  // Update activeBuses count based on real driver data
  useEffect(() => {
    setActiveBuses(driverLocations.length);
  }, [driverLocations]);

  // Simulate bus data
  useEffect(() => {
    const buses: BusData[] = Array.from({ length: 12 }, (_, i) => ({
      id: `bus-${i + 1}`,
      busNumber: i + 1,
      status: i < 8 ? "active" : "idle",
      currentLocation: i < 8 ? "On Route" : "Parking Lot",
      passengers: i < 8 ? Math.floor(Math.random() * 30 + 20) : 0,
      trips: i < 8 ? Math.floor(Math.random() * 3 + 1) : 0
    }));
    
    setBusesData(buses);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/admin/auth");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const adminName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CampusTransit</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Admin Dashboard</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{adminName}</p>
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
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-full">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{adminName}</p>
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

      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">Monitor fleet, analyze demand, and optimize routes</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
              <Bus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBuses}</div>
              <p className="text-xs text-muted-foreground">online right now</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Student requests</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgWaitTime}</div>
              <p className="text-xs text-green-600">↓ 15% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{efficiency}%</div>
              <p className="text-xs text-green-600">↑ 3% from last week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Student Requests</TabsTrigger>
            <TabsTrigger value="fleet">Fleet Status</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ✨ UPDATED: Live Driver Tracking */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle>Live Driver Tracking</CardTitle>
                  <CardDescription>
                    Real-time locations of all active drivers ({driverLocations.length} online)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {driverLocations.map((driver) => (
                        <div 
                          key={driver.id} 
                          className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <p className="font-semibold text-sm text-gray-900">
                                {driver.displayName || driver.email}
                              </p>
                            </div>
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
                              ACTIVE
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-600">
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {driver.latitude?.toFixed(5)}, {driver.longitude?.toFixed(5)}
                            </p>
                            <p className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              Speed: {(driver.speed || 0).toFixed(1)} km/h
                            </p>
                            <p className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Updated: {driver.timestamp?.toDate?.()?.toLocaleTimeString() || 'Just now'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {driverLocations.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Bus className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No active drivers</p>
                        <p className="text-xs mt-1">Drivers will appear here when they start sharing location</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest system events and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentRequests.slice(0, 5).map((request, idx) => (
                      <div key={request.id} className="flex items-start gap-3">
                        <div className={`h-2 w-2 rounded-full mt-2 ${
                          request.status === 'Pending' ? 'bg-orange-500' : 
                          request.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Request: {request.source} → {request.destination}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.createdAt?.toDate?.()?.toLocaleTimeString() || 'Just now'}
                          </p>
                        </div>
                        <Badge variant={request.status === 'Pending' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>All Student Requests</CardTitle>
                <CardDescription>Manage and monitor student transportation requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="p-4 border-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {request.source} → {request.destination}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Request ID: {request.id.slice(0, 8)}
                          </p>
                        </div>
                        <Badge variant={request.status === 'Pending' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {request.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                      </p>
                    </div>
                  ))}
                  {recentRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No requests yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fleet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {busesData.map((bus) => (
                <Card key={bus.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Bus #{bus.busNumber}</CardTitle>
                      <Badge variant={bus.status === "active" ? "default" : "secondary"} className={bus.status === "active" ? "bg-green-500" : ""}>
                        {bus.status === "active" ? "Active" : "Idle"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="text-muted-foreground">
                        {bus.currentLocation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">
                        {bus.passengers} passengers
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <span className="text-muted-foreground">
                        {bus.trips} trips today
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortal;
