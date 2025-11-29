// src/pages/StudentPortal.tsx - UPDATED WITH LIVE MAP

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Calendar, Bus, LogOut, User, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createBooking, getStudentBookings } from "../api/index";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import LiveDriverMap from "@/components/LiveDriverMap";

const StudentPortal = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDrivers, setActiveDrivers] = useState<any[]>([]);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/student/auth");
    } else {
      loadBookings();
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().slice(0, 5));
  }, []);

  // 🔥 REAL-TIME DRIVER LISTENER (fixed normalization of lat/lng)
  useEffect(() => {
    const driversQuery = query(
      collection(db, "driver_locations"),
      where("isActive", "==", true)
    );

    const unsubscribe = onSnapshot(
      driversQuery,
      (snapshot) => {
        const drivers = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            latitude: Number(data.latitude || data.lat || data.position?.lat),
            longitude: Number(data.longitude || data.lng || data.position?.lng),
            ...data,
          };
        });

        setActiveDrivers(drivers);
        console.log(`📍 Tracking ${drivers.length} active driver(s)`);
      },
      (error) => {
        console.error("Error listening to drivers:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await getStudentBookings();
      setBookings(data.bookings || []);
    } catch (error: any) {
      console.error("Failed to load bookings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!source || !destination || !date || !time) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const pickupDateTime = new Date(`${date}T${time}`).toISOString();

      await createBooking({
        source,
        destination,
        pickup_time: pickupDateTime,
      });

      toast.success("Bus request submitted successfully!", {
        description: `From ${source} to ${destination}`,
      });

      setSource("");
      setDestination("");
      const now = new Date();
      setDate(now.toISOString().split("T")[0]);
      setTime(now.toTimeString().slice(0, 5));

      await loadBookings();
    } catch (error: any) {
      toast.error("Failed to submit request: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/student/auth");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-orange-500",
      confirmed: "bg-blue-500",
      in_progress: "bg-purple-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const userName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "Student";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gray-700 p-2 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CampusTransit</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Student Portal</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                <div className="bg-gray-700 p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
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
              {mobileMenuOpen ? <X className="h-6 w-6 text-gray-800" /> : <Menu className="h-6 w-6 text-gray-800" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Hello, {userName}! 👋
          </h2>
          <p className="text-gray-600">Ready to plan your campus journey?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Request Form */}
          <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gray-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-6 w-6" />
                Request Campus Transport
              </CardTitle>
              <CardDescription className="text-gray-200">Book your ride across campus</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    Pickup Location
                  </Label>
                  <Input
                    placeholder="e.g., Main Gate, Library"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    Destination
                  </Label>
                  <Input
                    placeholder="e.g., Academic Block"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700 font-medium">
                      <Clock className="h-4 w-4 text-gray-600" />
                      Time
                    </Label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full h-11 bg-gray-700 text-white font-semibold shadow-md hover:bg-gray-800"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Requests */}
          <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-gray-900">Your Bookings</CardTitle>
              <CardDescription>Track your pending and completed trips</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {booking.source} → {booking.destination}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(booking.pickup_time).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Booking ID: #{booking.id}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 border-2 border-dashed border-gray-300 bg-gray-50 text-center rounded-lg">
                    <Bus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No bookings yet</p>
                    <p className="text-xs text-gray-400 mt-1">Submit a request to get started!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✨ Live Driver Tracking Map */}
        <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Bus className="h-6 w-6 text-gray-600" />
              Live Driver Tracking
            </CardTitle>
            <CardDescription>
              Track active drivers in real-time ({activeDrivers.length} online)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <LiveDriverMap drivers={activeDrivers} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentPortal;
